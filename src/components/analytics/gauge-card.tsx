import { useMemo } from "react"
import { Info } from "lucide-react"
import { Line, LineChart, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useResourceGauge, useResourceSparks } from "@/queries/analytics"

import {
  buildChartData,
  firstGaugeValue,
  formatCount,
  formatTooltipLabel,
  metricKey,
  sparkTrendColor,
  useLazyVisibility,
} from "@/lib/analytics"
import DashboardCard from "./dashboard-card"

export default function GaugeCard({
  title,
  metric,
  range,
  enabled,
  tooltip,
}: {
  title: string
  metric: "alus" | "users" | "licenses" | "machines"
  range: { start: string; end: string }
  enabled: boolean
  tooltip?: string
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
      <DashboardCard
        title={title}
        action={
          tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-m-1 size-6 text-content-subdued hover:text-content-normal"
                >
                  <Info className="size-3.5" />
                  <span className="sr-only">What is {title}?</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="end"
                className="max-w-64 bg-background-4 text-pretty text-content-muted"
              >
                {tooltip}
              </TooltipContent>
            </Tooltip>
          ) : null
        }
      >
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
