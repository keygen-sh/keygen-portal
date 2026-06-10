import { useEffect, useMemo, useRef, useState } from "react"
import { eachDayOfInterval, format, parseISO, subDays } from "date-fns"

import { ChartConfig } from "@/components/ui/chart"

import { GaugeEntry, SparkEntry } from "@/types/analytics"

import { GREEN, GRAY, METRIC_COLORS, RED } from "./chart-constants"

export function metricKey(metric: string) {
  return metric.replace(/[^a-zA-Z0-9_]/g, "_")
}

export function metricLabel(metric: string) {
  return displayMetric(metric)
}

export function truncateMiddle(value: string, maxLength: number) {
  if (value.length <= maxLength) return value

  const headLength = Math.ceil((maxLength - 3) / 2)
  const tailLength = Math.floor((maxLength - 3) / 2)

  return `${value.slice(0, headLength)}...${value.slice(-tailLength)}`
}

export function displayMetric(metric: string) {
  if (metric.startsWith("events.")) {
    const event = metric.replace(/^events\./, "")
    const match = Object.keys(METRIC_COLORS).find(
      (key) => key.replace(/\./g, "-") === event,
    )

    return match ?? metric
  }

  return metric
}

export function formatCount(value?: number | null) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
    value ?? 0,
  )
}

export function formatTooltipLabel(label: unknown) {
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : ""
}

export function useAnalyticsRange(days: number) {
  return useMemo(() => {
    const end = new Date()
    const start = subDays(end, days - 1)

    return {
      end: format(end, "yyyy-MM-dd"),
      start: format(start, "yyyy-MM-dd"),
    }
  }, [days])
}

export function useLazyVisibility<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    if (hasEntered) return

    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === "undefined") {
      setHasEntered(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true)
          observer.disconnect()
        }
      },
      { rootMargin: "160px 0px" },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [hasEntered])

  return { ref, hasEntered }
}

export function buildChartData(
  sparks: SparkEntry[],
  expectedMetrics?: readonly string[],
  range?: { start: string; end: string },
) {
  const presentMetrics = Array.from(
    new Set(sparks.map((entry) => entry.metric)),
  )
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

export function firstGaugeValue(data?: GaugeEntry[]) {
  return data?.reduce((sum, entry) => sum + entry.count, 0) ?? 0
}

export function sparkTrendColor(spark: SparkEntry[]) {
  const sorted = [...spark].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]?.count ?? 0
  const last = sorted[sorted.length - 1]?.count ?? 0

  return last < first ? RED : GREEN
}
