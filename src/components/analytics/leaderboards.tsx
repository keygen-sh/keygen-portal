import { useMemo, useState } from "react"
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

import { GREEN, LEADERBOARDS } from "./chart-constants"
import { truncateMiddle, useLazyVisibility } from "./chart-utils"
import EmptyChart from "./empty-chart"

function LeaderboardCard({
  metric,
  range,
  enabled,
}: {
  metric: (typeof LEADERBOARDS)[number]["metric"]
  range: { start: string; end: string }
  enabled: boolean
}) {
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
