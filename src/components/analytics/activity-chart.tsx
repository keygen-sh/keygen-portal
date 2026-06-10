import { useMemo } from "react"
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

import { buildChartData, metricKey } from "./chart-utils"
import DashboardCard from "./dashboard-card"
import EmptyChart from "./empty-chart"

export default function ActivityChart({
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
              tickFormatter={(value: string) => value.slice(5)}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
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
