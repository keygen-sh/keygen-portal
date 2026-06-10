import { useMemo, useState, type MouseEvent, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

import { SparkEntry } from "@/types/analytics"

import {
  buildChartData,
  formatChartAxisDate,
  formatTooltipLabel,
  metricDataKey,
} from "@/lib/analytics"
import Card from "./card"
import EmptyChart from "./empty-chart"

export default function ActivityChart({
  title,
  action,
  actionClassName,
  data,
  expectedMetrics,
  range,
  isLoading,
}: {
  title: string
  action?: ReactNode
  actionClassName?: string
  data: SparkEntry[]
  expectedMetrics: readonly string[]
  range: { start: string; end: string }
  isLoading: boolean
}) {
  const chart = useMemo(
    () => buildChartData(data, expectedMetrics, range),
    [data, expectedMetrics, range],
  )
  const dataKeys = useMemo(
    () =>
      chart.metrics.reduce(
        (acc, metric) => {
          acc[metric] = metricDataKey(metric)
          return acc
        },
        {} as Record<string, ReturnType<typeof metricDataKey>>,
      ),
    [chart.metrics],
  )
  const [filteredMetrics, setFilteredMetrics] =
    useState<ReadonlySet<string> | null>(null)
  const visibleMetrics = useMemo(
    () => filteredMetrics ?? new Set(chart.metrics),
    [chart.metrics, filteredMetrics],
  )
  const inactiveMetrics = useMemo(
    () => chart.metrics.filter((metric) => !visibleMetrics.has(metric)),
    [chart.metrics, visibleMetrics],
  )
  const legendItems = useMemo(
    () =>
      chart.metrics.map((metric) => ({
        color: chart.colors[metric],
        value: metric,
      })),
    [chart.colors, chart.metrics],
  )

  function filterMetric(metric: string, event: MouseEvent<HTMLButtonElement>) {
    setFilteredMetrics((current) => {
      if (!event.ctrlKey && !event.metaKey) {
        return current?.size === 1 && current.has(metric)
          ? null
          : new Set([metric])
      }

      const next = new Set(current ?? [])

      if (next.has(metric)) {
        next.delete(metric)
      } else {
        next.add(metric)
      }

      return next.size ? next : null
    })
  }

  return (
    <Card title={title} action={action} actionClassName={actionClassName}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chart.data.length === 0 ? (
        <EmptyChart />
      ) : (
        <ChartContainer config={chart.config} className="h-64 w-full min-w-0">
          <BarChart
            accessibilityLayer
            data={chart.data}
            margin={{ left: 0, right: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={formatChartAxisDate}
            />
            <YAxis hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={formatTooltipLabel}
                />
              }
            />
            <ChartLegend
              content={
                <ChartLegendContent
                  nameKey="value"
                  items={legendItems}
                  inactiveKeys={inactiveMetrics}
                  onItemToggle={filterMetric}
                />
              }
            />
            {chart.metrics.map((metric) => (
              <Bar
                key={metric}
                dataKey={dataKeys[metric]}
                name={metric}
                stackId="1"
                fill={chart.colors[metric]}
                hide={!visibleMetrics.has(metric)}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  )
}
