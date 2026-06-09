import { useMemo } from "react"
import { eachDayOfInterval, format, parseISO, subDays } from "date-fns"
import { Activity, BarChart3, Lock } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Text,
  XAxis,
  YAxis,
} from "recharts"

import LockedOverlay from "@/components/locked-overlay"
import CursorTooltip from "@/components/cursor-tooltip"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useCloud } from "@/hooks/use-cloud"
import { useEdition } from "@/hooks/use-edition"
import { usePermissions } from "@/hooks/use-permissions"
import { useCursorFollowTooltip } from "@/hooks/use-cursor-follow-tooltip"

import { useGetAccount, useGetAccountPlan } from "@/queries/accounts"
import {
  useEventSparks,
  useRequestLeaderboard,
  useRequestSparks,
  useResourceGauge,
  useResourceSparks,
  useValidationSparks,
} from "@/queries/analytics"

import { GaugeEntry, SparkEntry } from "@/types/analytics"

import * as keygen from "@/keygen"

import { cn } from "@/lib/utils"
import { eventLogBadgeVariant } from "@/lib/event-logs"

import LicenseExpirationHeatmap from "./license-expiration-heatmap"
import GoToButton from "@/components/go-to-button"

const PRICING_URL = "https://keygen.sh/pricing"
const CHART_COLORS = [
  "var(--color-secondary)",
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-destructive)",
] as const

const [BLUE, GREEN, AMBER, RED] = CHART_COLORS
const GRAY = "var(--color-content-normal)"

function chartMix(color: string, mixColor: string, weight: 40 | 50 | 60) {
  return `color-mix(in oklch, ${color} ${weight}%, ${mixColor})`
}

const REQUEST_METRICS = [
  "requests.2xx",
  "requests.3xx",
  "requests.4xx",
  "requests.5xx",
] as const

const METRIC_COLORS: Record<string, string> = {
  "requests.2xx": GREEN,
  "requests.3xx": BLUE,
  "requests.4xx": AMBER,
  "requests.5xx": RED,
  "validations.valid": GREEN,
  "validations.banned": RED,
  "validations.expired": chartMix(RED, AMBER, 60),
  "validations.suspended": chartMix(RED, BLUE, 60),
  "validations.overdue": chartMix(AMBER, RED, 60),
  "validations.no-machine": chartMix(BLUE, GREEN, 60),
  "validations.no-machines": chartMix(BLUE, GREEN, 40),
  "validations.too-many-machines": chartMix(AMBER, RED, 60),
  "validations.too-many-users": AMBER,
  "validations.too-many-cores": chartMix(BLUE, AMBER, 60),
  "validations.too-many-processes": BLUE,
  "validations.too-much-memory": chartMix(RED, BLUE, 40),
  "validations.too-much-disk": chartMix(RED, AMBER, 60),
  "validations.entitlements-missing": chartMix(AMBER, BLUE, 60),
  "validations.fingerprint-scope-mismatch": chartMix(BLUE, RED, 60),
  "validations.machine-scope-mismatch": chartMix(BLUE, GREEN, 60),
  "validations.policy-scope-mismatch": chartMix(AMBER, BLUE, 60),
  "validations.product-scope-mismatch": chartMix(AMBER, GREEN, 60),
  "validations.heartbeat-not-started": chartMix(AMBER, RED, 50),
  "validations.heartbeat-dead": RED,
  "validations.not-found": GRAY,
  "release.downloaded": BLUE,
  "release.upgraded": GREEN,
  "user.created": GREEN,
  "user.deleted": RED,
  "license.created": GREEN,
  "license.expired": chartMix(RED, AMBER, 60),
  "license.checked-out": BLUE,
  "license.renewed": GREEN,
  "license.suspended": chartMix(RED, BLUE, 60),
  "license.revoked": RED,
  "license.deleted": RED,
  "machine.created": GREEN,
  "machine.deleted": RED,
  "machine.checked-out": BLUE,
  "machine.heartbeat.ping": chartMix(BLUE, GREEN, 60),
  "machine.heartbeat.pong": GREEN,
  "machine.heartbeat.dead": RED,
  "machine.heartbeat.reset": AMBER,
  "process.created": GREEN,
  "process.deleted": RED,
  "process.heartbeat.ping": chartMix(BLUE, GREEN, 60),
  "process.heartbeat.pong": GREEN,
  "process.heartbeat.dead": RED,
  "process.heartbeat.reset": AMBER,
}

const VALIDATION_METRICS = [
  "validations.valid",
  "validations.expired",
  "validations.suspended",
  "validations.overdue",
  "validations.no-machine",
  "validations.no-machines",
  "validations.too-many-machines",
  "validations.too-many-users",
  "validations.too-many-cores",
  "validations.too-many-processes",
  "validations.too-much-memory",
  "validations.too-much-disk",
  "validations.entitlements-missing",
  "validations.fingerprint-scope-mismatch",
  "validations.machine-scope-mismatch",
  "validations.policy-scope-mismatch",
  "validations.product-scope-mismatch",
  "validations.heartbeat-not-started",
  "validations.heartbeat-dead",
  "validations.not-found",
] as const

const EVENT_GROUPS = [
  {
    title: "Releases",
    events: ["release.downloaded", "release.upgraded"],
  },
  {
    title: "Users",
    events: ["user.created", "user.deleted"],
  },
  {
    title: "Licenses",
    events: [
      "license.created",
      "license.expired",
      "license.checked-out",
      "license.renewed",
      "license.suspended",
      "license.revoked",
      "license.deleted",
    ],
  },
  {
    title: "Machines",
    events: [
      "machine.created",
      "machine.deleted",
      "machine.checked-out",
      "machine.heartbeat.*",
    ],
  },
  {
    title: "Processes",
    events: ["process.created", "process.deleted", "process.heartbeat.*"],
  },
] as const

const LEADERBOARDS = [
  { metric: "ips", title: "Top IPs" },
  { metric: "urls", title: "Top URLs" },
  { metric: "licenses", title: "Top licenses" },
  { metric: "user-agents", title: "Top user agents" },
] as const

function metricKey(metric: string) {
  return metric.replace(/[^a-zA-Z0-9_]/g, "_")
}

function metricLabel(metric: string) {
  return displayMetric(metric)
}

function truncateMiddle(value: string, maxLength: number) {
  if (value.length <= maxLength) return value

  const headLength = Math.ceil((maxLength - 3) / 2)
  const tailLength = Math.floor((maxLength - 3) / 2)

  return `${value.slice(0, headLength)}...${value.slice(-tailLength)}`
}

function displayMetric(metric: string) {
  if (metric.startsWith("events.")) {
    const event = metric.replace(/^events\./, "")
    const match = Object.keys(METRIC_COLORS).find(
      (key) => key.replace(/\./g, "-") === event,
    )

    return match ?? metric
  }

  return metric
}

function formatCount(value?: number | null) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
    value ?? 0,
  )
}

function formatTooltipLabel(label: unknown) {
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : ""
}

function useAnalyticsRange() {
  return useMemo(() => {
    const end = new Date()
    const start = subDays(end, 29)

    return {
      end: format(end, "yyyy-MM-dd"),
      start: format(start, "yyyy-MM-dd"),
    }
  }, [])
}

function buildChartData(
  sparks: SparkEntry[],
  expectedMetrics?: readonly string[],
  range?: { start: string; end: string },
) {
  const presentMetrics = Array.from(new Set(sparks.map((entry) => entry.metric)))
  const metrics = expectedMetrics?.length
    ? [
        ...expectedMetrics.filter((metric) => presentMetrics.includes(metric)),
        ...presentMetrics.filter((metric) => !expectedMetrics.includes(metric)),
      ]
    : presentMetrics
  const byDate = new Map<string, Record<string, string | number>>()

  for (const entry of sparks) {
    const row = byDate.get(entry.date) ?? { date: entry.date }
    row[metricKey(entry.metric)] = entry.count
    byDate.set(entry.date, row)
  }

  const dates =
    range && metrics.length
      ? eachDayOfInterval({
          start: parseISO(range.start),
          end: parseISO(range.end),
        }).map((date) => format(date, "yyyy-MM-dd"))
      : Array.from(byDate.keys()).sort()

  const data = dates.map((date) => byDate.get(date) ?? { date })

  for (const row of data) {
    for (const metric of metrics) {
      row[metricKey(metric)] ??= 0
    }
  }

  const config = metrics.reduce((acc, metric) => {
    const colorMetric = displayMetric(metric)

    acc[metricKey(metric)] = {
      label: metricLabel(metric),
      color: METRIC_COLORS[colorMetric] ?? GRAY,
    }

    return acc
  }, {} as ChartConfig)

  return { config, data, metrics }
}

function firstGaugeValue(data?: GaugeEntry[]) {
  return data?.reduce((sum, entry) => sum + entry.count, 0) ?? 0
}

function sparkTrendColor(spark: SparkEntry[]) {
  const sorted = [...spark].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]?.count ?? 0
  const last = sorted[sorted.length - 1]?.count ?? 0

  return last < first ? RED : GREEN
}

function DashboardCard({
  title,
  action,
  children,
  className,
  actionClassName,
  contentClassName,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  actionClassName?: string
  contentClassName?: string
}) {
  return (
    <Card
      className={cn(
        "group/card gap-0 rounded-md border-accent bg-background p-0",
        className,
      )}
    >
      <CardHeader className="border-b border-accent px-4 pt-3 [.border-b]:pb-2">
        <CardTitle className="text-sm font-medium text-content-muted">
          {title}
        </CardTitle>
        {action && <CardAction className={actionClassName}>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("p-4", contentClassName)}>{children}</CardContent>
    </Card>
  )
}

function AnalyticsLockedPreview({ reason }: { reason: "ce" | "free" | "permission" }) {
  const title =
    reason === "ce"
      ? "Analytics is an EE offering"
      : reason === "free"
        ? "Analytics requires a paid plan"
        : "Analytics permission required"
  const description =
    reason === "ce"
      ? "Request, event, and validation analytics depend on EE request and event logs."
      : reason === "free"
        ? "Upgrade your Cloud plan to unlock account analytics, charts, and leaderboards."
        : "Ask an account admin for analytics read access to view this dashboard."

  return (
    <LockedOverlay
      className="min-h-[720px]"
      icon={<Lock className="size-4" />}
      title={title}
      description={description}
      action={
        reason === "permission" ? null : (
          <Button size="sm" asChild>
            <a href={PRICING_URL} target="_blank" rel="noreferrer">
              View pricing
            </a>
          </Button>
        )
      }
    >
      <AnalyticsSkeleton />
    </LockedOverlay>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-md border-accent bg-background p-4">
            <Skeleton className="mb-5 h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-md" />
        <Skeleton className="h-72 rounded-md" />
      </div>
      <Skeleton className="h-96 rounded-md" />
    </div>
  )
}

function GaugeCard({
  title,
  metric,
  range,
  enabled,
}: {
  title: string
  metric: "alus" | "users" | "licenses" | "machines"
  range: { start: string; end: string }
  enabled: boolean
}) {
  const { data, isLoading, isError } = useResourceGauge(metric, { enabled })
  const { data: spark = [], isLoading: sparkLoading } = useResourceSparks(
    metric,
    range,
    { enabled },
  )
  const value = firstGaugeValue(data)
  const chart = useMemo(() => {
    const chart = buildChartData(spark, [metric], range)
    const key = metricKey(metric)

    if (chart.config[key]) {
      chart.config[key].color = sparkTrendColor(spark)
    }

    return chart
  }, [metric, range, spark])

  return (
    <DashboardCard title={title}>
      <div className="flex min-h-12 items-center gap-3">
        <div className="h-12 min-w-0 flex-1">
          {sparkLoading ? (
            <Skeleton className="h-full w-full" />
          ) : chart.data.length > 1 ? (
            <ChartContainer config={chart.config} className="h-full w-full">
              <LineChart
                accessibilityLayer
                data={chart.data}
                margin={{ top: 4, right: 8, bottom: 0, left: 2 }}
              >
                <XAxis hide dataKey="date" height={0} />
                <YAxis hide width={0} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={formatTooltipLabel}
                    />
                  }
                />
                <Line
                  dataKey={metricKey(metric)}
                  type="monotone"
                  stroke={`var(--color-${metricKey(metric)})`}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-full rounded-sm bg-background-1" />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-24 shrink-0" />
        ) : (
          <p className="shrink-0 text-right text-4xl font-semibold tabular-nums text-content-loud">
            {isError ? "--" : formatCount(value)}
          </p>
        )}
      </div>
    </DashboardCard>
  )
}

function EmptyChart({
  message = "No analytics data for this range.",
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-56 items-center justify-center rounded-md text-sm text-content-subdued",
        className,
      )}
    >
      {message}
    </div>
  )
}

function StackedBarChart({
  title,
  data,
  expectedMetrics,
  range,
  isLoading,
}: {
  title: string
  data: SparkEntry[]
  expectedMetrics: readonly string[]
  range: { start: string; end: string }
  isLoading: boolean
}) {
  const chart = useMemo(
    () => buildChartData(data, expectedMetrics, range),
    [data, expectedMetrics, range],
  )

  return (
    <DashboardCard title={title}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chart.data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ChartContainer config={chart.config} className="h-64 w-full">
          <BarChart accessibilityLayer data={chart.data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value: string) => value.slice(5)}
            />
            <YAxis hide />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {chart.metrics.map((metric) => (
              <Bar
                key={metric}
                dataKey={metricKey(metric)}
                stackId="1"
                fill={`var(--color-${metricKey(metric)})`}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ChartContainer>
      )}
    </DashboardCard>
  )
}

function EventSparkCard({
  event,
  range,
  enabled,
}: {
  event: string
  range: { start: string; end: string }
  enabled: boolean
}) {
  const { data = [], isLoading } = useEventSparks(event, range, { enabled })
  const chart = useMemo(() => buildChartData(data, undefined, range), [data, range])

  return (
    <DashboardCard
      title={
        <Badge variant={eventLogBadgeVariant(event)} className="font-mono">
          {event}
        </Badge>
      }
      action={
        <GoToButton
          path="/$accountId/app/event-logs"
          params={{ accountId: keygen.config.id }}
          search={{ events: [event] }}
          label="View logs"
          className="[&_.group:hover_svg]:text-primary [&_button]:text-content-normal [&_button]:hover:text-content-loud [&_svg]:text-content-normal"
        />
      }
      actionClassName="pointer-events-none opacity-0 transition-opacity group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100"
      contentClassName="p-3"
    >
      {isLoading ? (
        <Skeleton className="h-36 w-full" />
      ) : chart.data.length === 0 ? (
        <EmptyChart className="h-36" />
      ) : (
        <ChartContainer config={chart.config} className="h-36 w-full">
          <LineChart
            accessibilityLayer
            data={chart.data}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis hide dataKey="date" height={0} />
            <YAxis hide width={0} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            {chart.metrics.map((metric) => (
              <Line
                key={metric}
                dataKey={metricKey(metric)}
                type="monotone"
                stroke={`var(--color-${metricKey(metric)})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      )}
    </DashboardCard>
  )
}

function EventCharts({
  range,
  enabled,
}: {
  range: { start: string; end: string }
  enabled: boolean
}) {
  const groups = useMemo(
    () =>
      [...EVENT_GROUPS]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((group) => ({
          ...group,
          events: [...group.events].sort((a, b) => a.localeCompare(b)),
        })),
    [],
  )

  return (
    <Tabs defaultValue={groups[0].title} className="gap-4">
      <TabsList className="h-auto flex-wrap justify-start rounded-md bg-background-1">
        {groups.map((group) => (
          <TabsTrigger key={group.title} value={group.title}>
            {group.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {groups.map((group) => (
        <TabsContent key={group.title} value={group.title} className="mt-0">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {group.events.map((event) => (
              <EventSparkCard
                key={event}
                event={event}
                range={range}
                enabled={enabled}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

function LeaderboardCard({
  metric,
  range,
  enabled,
}: {
  metric: (typeof LEADERBOARDS)[number]["metric"]
  range: { start: string; end: string }
  enabled: boolean
}) {
  const { data = [], isLoading } = useRequestLeaderboard(metric, {
    ...range,
    enabled,
    limit: 10,
  })
  const chartConfig = {
    count: {
      label: "Requests",
      color: GREEN,
    },
  } satisfies ChartConfig

  const chartData = data.map((entry) => ({
    ...entry,
  }))
  const {
    active: hoveredDiscriminator,
    tooltipRef,
    currentPos,
    open,
    move,
    close,
  } = useCursorFollowTooltip<string>()

  return (
    <Card className="gap-0 rounded-md border-accent bg-background p-0">
      <CardContent className="p-4">
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis hide type="number" />
              <YAxis
                dataKey="discriminator"
                type="category"
                tickLine={false}
                axisLine={false}
                width={180}
                tick={
                  <LeaderboardTick
                    onMouseEnter={open}
                    onMouseMove={move}
                    onMouseLeave={close}
                  />
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    labelKey="count"
                    nameKey="discriminator"
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[0, 3, 3, 0]}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.discriminator}
                    fill="var(--color-count)"
                    fillOpacity={Math.max(0.1, 1 - index * 0.1)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CursorTooltip
        open={!!hoveredDiscriminator}
        tooltipRef={tooltipRef}
        currentPos={currentPos}
        offset={8}
        className="max-w-[min(32rem,calc(100vw-2rem))] break-all"
      >
        {hoveredDiscriminator}
      </CursorTooltip>
    </Card>
  )
}

function LeaderboardTick({
  x,
  y,
  payload,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}: {
  x?: number
  y?: number
  payload?: { value?: string }
  onMouseEnter?: (item: string, event: React.MouseEvent) => void
  onMouseMove?: (event: React.MouseEvent) => void
  onMouseLeave?: () => void
}) {
  const discriminator = String(payload?.value ?? "")
  const label = truncateMiddle(discriminator, 34)

  return (
    <g
      className="cursor-help"
      transform={`translate(${x ?? 0},${y ?? 0})`}
      onMouseEnter={(event) => onMouseEnter?.(discriminator, event)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Text
        x={0}
        y={0}
        width={168}
        maxLines={1}
        textAnchor="end"
        verticalAnchor="middle"
        className="fill-content-subdued text-[11px]"
      >
        {label}
      </Text>
    </g>
  )
}

function Leaderboards({
  range,
  enabled,
}: {
  range: { start: string; end: string }
  enabled: boolean
}) {
  const leaderboards = useMemo(
    () => [...LEADERBOARDS].sort((a, b) => a.title.localeCompare(b.title)),
    [],
  )

  return (
    <Tabs defaultValue={leaderboards[0].metric} className="gap-4">
      <TabsList className="h-auto flex-wrap justify-start rounded-md bg-background-1">
        {leaderboards.map((leaderboard) => (
          <TabsTrigger key={leaderboard.metric} value={leaderboard.metric}>
            {leaderboard.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {leaderboards.map((leaderboard) => (
        <TabsContent
          key={leaderboard.metric}
          value={leaderboard.metric}
          className="mt-0"
        >
          <LeaderboardCard
            metric={leaderboard.metric}
            range={range}
            enabled={enabled}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function AnalyticsContent({ enabled }: { enabled: boolean }) {
  const range = useAnalyticsRange()
  const { data: requests = [], isLoading: requestsLoading } = useRequestSparks(
    range,
    { enabled },
  )
  const { data: validations = [], isLoading: validationsLoading } =
    useValidationSparks(range, { enabled })

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GaugeCard
          title="ALUs"
          metric="alus"
          range={range}
          enabled={enabled}
        />
        <GaugeCard
          title="Users"
          metric="users"
          range={range}
          enabled={enabled}
        />
        <GaugeCard
          title="Licenses"
          metric="licenses"
          range={range}
          enabled={enabled}
        />
        <GaugeCard
          title="Machines"
          metric="machines"
          range={range}
          enabled={enabled}
        />
      </div>

      <LicenseExpirationHeatmap />

      <div className="grid gap-4 xl:grid-cols-2">
        <StackedBarChart
          title="Requests"
          data={requests}
          expectedMetrics={REQUEST_METRICS}
          range={range}
          isLoading={requestsLoading}
        />
        <StackedBarChart
          title="Validations"
          data={validations}
          expectedMetrics={VALIDATION_METRICS}
          range={range}
          isLoading={validationsLoading}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-content-muted">
          <Activity className="size-4 text-content-subdued" />
          Events
        </div>
        <EventCharts range={range} enabled={enabled} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-content-muted">
          <BarChart3 className="size-4 text-content-subdued" />
          Leaderboards
        </div>
        <Leaderboards range={range} enabled={enabled} />
      </section>
    </div>
  )
}

export default function DashboardAnalytics() {
  const { isCloud } = useCloud()
  const { isCE } = useEdition()
  const { can, isLoading: permissionsLoading } = usePermissions()
  const { data: account, isLoading: accountLoading } = useGetAccount()
  const planId = account?.relationships.plan?.data?.id
  const { data: plan, isLoading: planLoading } = useGetAccountPlan(
    isCloud ? planId : undefined,
  )

  const hasPermission = can("account.analytics.read")
  const isFreePlan = isCloud && /free/i.test(plan?.attributes.name ?? "")
  const isChecking = permissionsLoading || accountLoading || (isCloud && planLoading)

  if (isChecking) {
    return <AnalyticsSkeleton />
  }

  if (!hasPermission) {
    return <AnalyticsLockedPreview reason="permission" />
  }

  if (isCE) {
    return <AnalyticsLockedPreview reason="ce" />
  }

  if (isFreePlan) {
    return <AnalyticsLockedPreview reason="free" />
  }

  return <AnalyticsContent enabled />
}
