import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import GoToButton from "@/components/go-to-button"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useEventSparks } from "@/queries/analytics"

import * as keygen from "@/keygen"

import {
  eventLogBadgeVariant,
  expandEventLogEventFilters,
} from "@/lib/event-logs"

import { EVENT_GROUPS } from "./chart-constants"
import { buildChartData, metricKey, useLazyVisibility } from "./chart-utils"
import DashboardCard from "./dashboard-card"
import EmptyChart from "./empty-chart"

function EventSparkCard({
  event,
  range,
  enabled,
}: {
  event: string
  range: { start: string; end: string }
  enabled: boolean
}) {
  const { ref, hasEntered } = useLazyVisibility<HTMLDivElement>()
  const canLoad = enabled && hasEntered
  const { data = [], isLoading } = useEventSparks(event, range, {
    enabled: canLoad,
  })
  const chart = useMemo(
    () => buildChartData(data, undefined, range),
    [data, range],
  )
  const eventLogFilters = expandEventLogEventFilters([event])

  return (
    <div ref={ref}>
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
            search={{ events: eventLogFilters }}
            label="View logs"
            className="[&_.group:hover_svg]:text-primary [&_button]:text-content-normal [&_button]:hover:text-content-loud [&_svg]:text-content-normal"
          />
        }
        actionClassName="pointer-events-none opacity-0 transition-opacity group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100"
        contentClassName="p-3"
      >
        {!canLoad || isLoading ? (
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
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
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
    </div>
  )
}

export default function EventCharts({
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
  const [activeGroup, setActiveGroup] = useState(groups[0].title)

  return (
    <Tabs
      value={activeGroup}
      onValueChange={(value) =>
        setActiveGroup(value as (typeof EVENT_GROUPS)[number]["title"])
      }
      className="gap-4"
    >
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
                enabled={enabled && group.title === activeGroup}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
