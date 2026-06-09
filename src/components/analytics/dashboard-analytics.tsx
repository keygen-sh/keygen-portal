import { useMemo } from "react"
import { format, subDays } from "date-fns"
import {
  Activity,
  BarChart3,
  Crown,
  KeyRound,
  Lock,
  MonitorSmartphone,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import LockedOverlay from "@/components/locked-overlay"
import { Button } from "@/components/ui/button"
import {
  Card,
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

import { cn, humanize } from "@/lib/utils"

import LicenseExpirationHeatmap from "./license-expiration-heatmap"

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
  const parts = displayMetric(metric).split(".")
  return humanize(parts[parts.length - 1])
}

function displayMetric(metric: string) {
  if (metric.startsWith("events.")) {
    return metric.replace(/^events\./, "").replace(/-/g, ".")
  }

  return metric
}

function formatCount(value?: number | null) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
    value ?? 0,
  )
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

  const data = Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  )

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

function DashboardCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("gap-0 rounded-md border-accent bg-background p-0", className)}>
      <CardHeader className="border-b border-accent px-4 pt-3 [.border-b]:pb-2">
        <CardTitle className="text-sm font-medium text-content-muted">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
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
  icon: Icon,
  metric,
  range,
  enabled,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
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
  const chart = useMemo(() => buildChartData(spark, [metric]), [metric, spark])

  return (
    <Card className="rounded-md border-accent bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-content-subdued">{title}</p>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-20" />
          ) : (
            <p className="mt-2 text-2xl font-semibold tabular-nums text-content-loud">
              {isError ? "--" : formatCount(value)}
            </p>
          )}
        </div>
        <span className="rounded-md border border-accent bg-background-1 p-2 text-content-normal">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-4 h-12">
        {sparkLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chart.data.length > 1 ? (
          <ChartContainer config={chart.config} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={chart.data}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
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
    </Card>
  )
}

function EmptyChart({ message = "No analytics data for this range." }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-accent text-sm text-content-subdued">
      {message}
    </div>
  )
}

function StackedBarChart({
  title,
  data,
  expectedMetrics,
  isLoading,
}: {
  title: string
  data: SparkEntry[]
  expectedMetrics: readonly string[]
  isLoading: boolean
}) {
  const chart = useMemo(
    () => buildChartData(data, expectedMetrics),
    [data, expectedMetrics],
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
  const chart = useMemo(() => buildChartData(data), [data])

  return (
    <DashboardCard title={event}>
      {isLoading ? (
        <Skeleton className="h-44 w-full" />
      ) : chart.data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ChartContainer config={chart.config} className="h-44 w-full">
          <LineChart accessibilityLayer data={chart.data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis hide dataKey="date" />
            <YAxis hide />
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
  return (
    <Tabs defaultValue={EVENT_GROUPS[0].title} className="gap-4">
      <TabsList className="h-auto flex-wrap justify-start rounded-md bg-background-1">
        {EVENT_GROUPS.map((group) => (
          <TabsTrigger key={group.title} value={group.title}>
            {group.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {EVENT_GROUPS.map((group) => (
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
  title,
  range,
  enabled,
}: {
  metric: (typeof LEADERBOARDS)[number]["metric"]
  title: string
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
      color: "var(--color-secondary)",
    },
  } satisfies ChartConfig

  const chartData = data.map((entry) => ({
    ...entry,
    label:
      entry.discriminator.length > 28
        ? `${entry.discriminator.slice(0, 25)}...`
        : entry.discriminator,
  }))

  return (
    <DashboardCard title={title}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chartData.length === 0 ? (
        <EmptyChart />
      ) : (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 4, right: 20 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis hide type="number" />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={96}
              tick={{ fontSize: 11 }}
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
            />
          </BarChart>
        </ChartContainer>
      )}
    </DashboardCard>
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
          icon={Crown}
          metric="alus"
          range={range}
          enabled={enabled}
        />
        <GaugeCard
          title="Users"
          icon={Users}
          metric="users"
          range={range}
          enabled={enabled}
        />
        <GaugeCard
          title="Licenses"
          icon={KeyRound}
          metric="licenses"
          range={range}
          enabled={enabled}
        />
        <GaugeCard
          title="Machines"
          icon={MonitorSmartphone}
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
          isLoading={requestsLoading}
        />
        <StackedBarChart
          title="Validations"
          data={validations}
          expectedMetrics={VALIDATION_METRICS}
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
        <div className="grid gap-4 xl:grid-cols-2">
          {LEADERBOARDS.map((leaderboard) => (
            <LeaderboardCard
              key={leaderboard.metric}
              metric={leaderboard.metric}
              title={leaderboard.title}
              range={range}
              enabled={enabled}
            />
          ))}
        </div>
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
