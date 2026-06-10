import { useMemo } from "react"
import { Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

import { useResourceGauge, useResourceSparks } from "@/queries/analytics"

import {
  buildChartData,
  firstGaugeValue,
  formatCount,
  formatTooltipLabel,
  metricKey,
  sparkTrendColor,
  useLazyVisibility,
} from "./chart-utils"
import DashboardCard from "./dashboard-card"

export default function GaugeCard({
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
  const { ref, hasEntered } = useLazyVisibility<HTMLDivElement>()
  const canLoad = enabled && hasEntered
  const { data, isLoading, isError } = useResourceGauge(metric, {
    enabled: canLoad,
  })
  const { data: spark = [], isLoading: sparkLoading } = useResourceSparks(
    metric,
    range,
    { enabled: canLoad },
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
    <div ref={ref}>
      <DashboardCard title={title}>
        <div className="flex min-h-12 items-center gap-3">
          {!canLoad || isLoading ? (
            <Skeleton className="h-10 w-24 shrink-0" />
          ) : (
            <p className="shrink-0 text-4xl font-semibold text-content-loud tabular-nums">
              {isError ? "--" : formatCount(value)}
            </p>
          )}
          <div className="h-12 min-w-0 flex-1">
            {!canLoad || sparkLoading ? (
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
        </div>
      </DashboardCard>
    </div>
  )
}
