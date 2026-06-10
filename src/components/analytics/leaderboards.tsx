import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Text,
  XAxis,
  YAxis,
} from "recharts"

import CursorTooltip from "@/components/cursor-tooltip"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useCursorFollowTooltip } from "@/hooks/use-cursor-follow-tooltip"

import { useRequestLeaderboard } from "@/queries/analytics"

import { GREEN, LEADERBOARDS, useLazyVisibility } from "@/lib/analytics"
import { truncator } from "@/lib/truncate"
import { HTTP_METHODS } from "@/types/request-logs"
import * as keygen from "@/keygen"
import EmptyChart from "./empty-chart"

const truncateMiddle = truncator("middle", { maxLength: 34 })

function requestLogSearchForLeaderboard({
  metric,
  discriminator,
  range,
}: {
  metric: (typeof LEADERBOARDS)[number]["metric"]
  discriminator: string
  range: { start: string; end: string }
}): Record<string, unknown> | null {
  const date = { ...range }

  switch (metric) {
    case "ips":
      return { ip: discriminator, date }
    case "urls": {
      const [possibleMethod, ...urlParts] = discriminator.split(" ")

      if (
        HTTP_METHODS.includes(
          possibleMethod as (typeof HTTP_METHODS)[number],
        ) &&
        urlParts.length > 0
      ) {
        return {
          method: possibleMethod,
          url: urlParts.join(" "),
          date,
        }
      }

      return { url: discriminator, date }
    }
    case "licenses":
      return {
        requestor: {
          type: "license",
          id: discriminator,
        },
        date,
      }
    case "user-agents":
      return null
  }
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
  const navigate = useNavigate()
  const { ref, hasEntered } = useLazyVisibility<HTMLDivElement>()
  const canLoad = enabled && hasEntered
  const { data = [], isLoading } = useRequestLeaderboard(metric, {
    ...range,
    enabled: canLoad,
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
  const requestLogSearch =
    hoveredDiscriminator == null
      ? null
      : requestLogSearchForLeaderboard({
          metric,
          discriminator: hoveredDiscriminator,
          range,
        })
  const handleDiscriminatorClick = async (discriminator: string) => {
    const search = requestLogSearchForLeaderboard({
      metric,
      discriminator,
      range,
    })

    if (!search) return

    await navigate({
      to: "/$accountId/app/request-logs",
      params: { accountId: keygen.config.id },
      search,
    })
  }

  return (
    <div ref={ref}>
      <Card className="gap-0 rounded-md border-accent bg-background p-0">
        <CardContent className="p-4">
          {!canLoad || isLoading ? (
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
                      canOpenRequestLogs={metric !== "user-agents"}
                      onMouseEnter={open}
                      onMouseMove={move}
                      onMouseLeave={close}
                      onClick={handleDiscriminatorClick}
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
          className="max-w-[min(32rem,calc(100vw-2rem))]"
        >
          {hoveredDiscriminator && (
            <>
              <span className="font-mono break-all text-content-normal">
                {hoveredDiscriminator}
              </span>
              {requestLogSearch && (
                <p className="mt-1.5 text-content-subdued">
                  Click to view request logs
                </p>
              )}
            </>
          )}
        </CursorTooltip>
      </Card>
    </div>
  )
}

function LeaderboardTick({
  x,
  y,
  payload,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onClick,
  canOpenRequestLogs,
}: {
  x?: number
  y?: number
  payload?: { value?: string }
  onMouseEnter?: (item: string, event: React.MouseEvent) => void
  onMouseMove?: (event: React.MouseEvent) => void
  onMouseLeave?: () => void
  onClick?: (item: string) => void
  canOpenRequestLogs?: boolean
}) {
  const discriminator = String(payload?.value ?? "")
  const label = truncateMiddle(discriminator)

  return (
    <g
      className={canOpenRequestLogs ? "cursor-pointer" : "cursor-help"}
      transform={`translate(${x ?? 0},${y ?? 0})`}
      onMouseEnter={(event) => onMouseEnter?.(discriminator, event)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick?.(discriminator)}
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

export default function Leaderboards({
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
  const [activeLeaderboard, setActiveLeaderboard] = useState(
    leaderboards[0].metric,
  )

  return (
    <Tabs
      value={activeLeaderboard}
      onValueChange={(value) =>
        setActiveLeaderboard(value as (typeof LEADERBOARDS)[number]["metric"])
      }
      className="gap-4"
    >
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
            enabled={enabled && leaderboard.metric === activeLeaderboard}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
