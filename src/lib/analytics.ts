import { useEffect, useMemo, useRef, useState } from "react"
import {
  eachDayOfInterval,
  format,
  getDay,
  addWeeks,
  parseISO,
  subDays,
  startOfWeek,
  differenceInCalendarWeeks,
} from "date-fns"

import { type ChartConfig } from "@/components/ui/chart"

import {
  ExpirationHeatmapEntry,
  ExpirationHeatmap,
  GaugeEntry,
  SparkEntry,
} from "@/types/analytics"

import { mix } from "@/lib/colors"

export const PRICING_URL = "https://keygen.sh/pricing"

export const CHART_COLORS = [
  "var(--color-secondary)",
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-destructive)",
] as const

export const [BLUE, GREEN, AMBER, RED] = CHART_COLORS
export const GRAY = "var(--color-content-normal)"

export const REQUEST_METRICS = [
  "requests.2xx",
  "requests.3xx",
  "requests.4xx",
  "requests.5xx",
] as const

export const METRIC_COLORS: Record<string, string> = {
  "requests.2xx": GREEN,
  "requests.3xx": BLUE,
  "requests.4xx": AMBER,
  "requests.5xx": RED,
  "validations.valid": GREEN,
  "validations.banned": RED,
  "validations.expired": mix({
    color: RED,
    with: AMBER,
    amount: 40,
  }),
  "validations.suspended": mix({
    color: RED,
    with: BLUE,
    amount: 10,
  }),
  "validations.overdue": mix({
    color: AMBER,
    with: RED,
    amount: 40,
  }),
  "validations.no-machine": mix({
    color: BLUE,
    with: RED,
    amount: 30,
  }),
  "validations.no-machines": mix({
    color: BLUE,
    with: RED,
    amount: 45,
  }),
  "validations.too-many-machines": mix({
    color: AMBER,
    with: RED,
    amount: 40,
  }),
  "validations.too-many-users": AMBER,
  "validations.too-many-cores": mix({
    color: BLUE,
    with: RED,
    amount: 60,
  }),
  "validations.too-many-processes": BLUE,
  "validations.too-much-memory": mix({
    color: RED,
    with: BLUE,
    amount: 60,
  }),
  "validations.too-much-disk": mix({
    color: RED,
    with: AMBER,
    amount: 40,
  }),
  "validations.fingerprint-scope-required": mix({
    color: BLUE,
    with: RED,
    amount: 55,
  }),
  "validations.entitlements-missing": mix({
    color: AMBER,
    with: RED,
    amount: 25,
  }),
  "validations.fingerprint-scope-mismatch": mix({
    color: BLUE,
    with: RED,
    amount: 40,
  }),
  "validations.fingerprint-scope-empty": mix({
    color: BLUE,
    with: RED,
    amount: 70,
  }),
  "validations.components-scope-required": mix({
    color: AMBER,
    with: RED,
    amount: 35,
  }),
  "validations.components-scope-mismatch": mix({
    color: AMBER,
    with: RED,
    amount: 55,
  }),
  "validations.user-scope-required": mix({
    color: BLUE,
    with: RED,
    amount: 35,
  }),
  "validations.user-scope-mismatch": mix({
    color: BLUE,
    with: RED,
    amount: 50,
  }),
  "validations.machine-scope-required": mix({
    color: BLUE,
    with: RED,
    amount: 15,
  }),
  "validations.machine-scope-mismatch": mix({
    color: BLUE,
    with: RED,
    amount: 25,
  }),
  "validations.policy-scope-required": mix({
    color: BLUE,
    with: RED,
    amount: 65,
  }),
  "validations.policy-scope-mismatch": mix({
    color: BLUE,
    with: RED,
    amount: 75,
  }),
  "validations.product-scope-required": mix({
    color: AMBER,
    with: RED,
    amount: 45,
  }),
  "validations.product-scope-mismatch": mix({
    color: AMBER,
    with: RED,
    amount: 65,
  }),
  "validations.entitlements-scope-empty": mix({
    color: AMBER,
    with: RED,
    amount: 75,
  }),
  "validations.version-scope-required": mix({
    color: BLUE,
    with: RED,
    amount: 80,
  }),
  "validations.version-scope-mismatch": mix({
    color: RED,
    with: BLUE,
    amount: 35,
  }),
  "validations.checksum-scope-required": mix({
    color: RED,
    with: BLUE,
    amount: 50,
  }),
  "validations.checksum-scope-mismatch": mix({
    color: RED,
    with: BLUE,
    amount: 65,
  }),
  "validations.heartbeat-not-started": mix({
    color: AMBER,
    with: RED,
    amount: 50,
  }),
  "validations.heartbeat-dead": RED,
  "validations.not-found": GRAY,
  "events.release-downloaded": BLUE,
  "events.release-upgraded": GREEN,
  "events.user-created": GREEN,
  "events.user-deleted": RED,
  "events.license-created": GREEN,
  "events.license-expired": mix({
    color: RED,
    with: AMBER,
    amount: 40,
  }),
  "events.license-checked-out": BLUE,
  "events.license-renewed": GREEN,
  "events.license-suspended": mix({
    color: RED,
    with: BLUE,
    amount: 40,
  }),
  "events.license-revoked": RED,
  "events.license-deleted": RED,
  "events.license-validation-succeeded": GREEN,
  "events.license-validation-failed": RED,
  "events.machine-created": GREEN,
  "events.machine-deleted": RED,
  "events.machine-checked-out": BLUE,
  "events.machine-heartbeat-ping": mix({
    color: BLUE,
    with: RED,
    amount: 20,
  }),
  "events.machine-heartbeat-pong": GREEN,
  "events.machine-heartbeat-dead": RED,
  "events.machine-heartbeat-reset": AMBER,
  "events.process-created": GREEN,
  "events.process-deleted": RED,
  "events.process-heartbeat-ping": mix({
    color: BLUE,
    with: RED,
    amount: 20,
  }),
  "events.process-heartbeat-pong": GREEN,
  "events.process-heartbeat-dead": RED,
  "events.process-heartbeat-reset": AMBER,
}

export const VALIDATION_METRICS = [
  "validations.valid",
  "validations.not-found",
  "validations.suspended",
  "validations.expired",
  "validations.overdue",
  "validations.no-machine",
  "validations.no-machines",
  "validations.too-many-machines",
  "validations.too-many-cores",
  "validations.too-much-memory",
  "validations.too-much-disk",
  "validations.too-many-processes",
  "validations.fingerprint-scope-required",
  "validations.fingerprint-scope-mismatch",
  "validations.fingerprint-scope-empty",
  "validations.components-scope-required",
  "validations.components-scope-mismatch",
  "validations.user-scope-required",
  "validations.user-scope-mismatch",
  "validations.heartbeat-not-started",
  "validations.heartbeat-dead",
  "validations.banned",
  "validations.product-scope-required",
  "validations.product-scope-mismatch",
  "validations.policy-scope-required",
  "validations.policy-scope-mismatch",
  "validations.machine-scope-required",
  "validations.machine-scope-mismatch",
  "validations.entitlements-missing",
  "validations.entitlements-scope-empty",
  "validations.version-scope-required",
  "validations.version-scope-mismatch",
  "validations.checksum-scope-required",
  "validations.checksum-scope-mismatch",
  "validations.too-many-users",
] as const

export const EVENT_GROUPS = [
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
      "license.validation.*",
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

export const LEADERBOARDS = [
  { metric: "ips", title: "Top IPs" },
  { metric: "urls", title: "Top URLs" },
  { metric: "licenses", title: "Top licenses" },
  { metric: "user-agents", title: "Top user agents" },
] as const

export type HeatmapRangeDays = 30 | 60 | 90 | 365
export type SparkRangeDays = 30 | 60 | 90
export type LeaderboardRangeDays = 30 | 60 | 90
export type SectionRangeDays =
  | HeatmapRangeDays
  | SparkRangeDays
  | LeaderboardRangeDays

export const HEATMAP_RANGE_OPTIONS: Array<{
  value: HeatmapRangeDays
  label: string
}> = [
  { value: 30, label: "Next 30 days" },
  { value: 60, label: "Next 60 days" },
  { value: 90, label: "Next 90 days" },
  { value: 365, label: "Next 1 year" },
] as const

export const SPARK_RANGE_OPTIONS: Array<{
  value: SparkRangeDays
  label: string
}> = [
  { value: 30, label: "Last 30 days" },
  { value: 60, label: "Last 60 days" },
  { value: 90, label: "Last 90 days" },
] as const

export const LEADERBOARD_RANGE_OPTIONS: Array<{
  value: LeaderboardRangeDays
  label: string
}> = [
  { value: 30, label: "Last 30 days" },
  { value: 60, label: "Last 60 days" },
  { value: 90, label: "Last 90 days" },
] as const

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
    row[entry.metric] = entry.count
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
      row[metric] ??= 0
    }
  }

  const config = metrics.reduce((acc, metric) => {
    acc[metric] = {
      label: metric,
    }

    return acc
  }, {} as ChartConfig)

  const colors = metrics.reduce(
    (acc, metric) => {
      acc[metric] = METRIC_COLORS[metric] ?? GRAY

      return acc
    },
    {} as Record<string, string>,
  )

  return { colors, config, data, metrics }
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

export function buildExpirationHeatmap(
  cells: ExpirationHeatmapEntry[],
  { start, end }: { start: Date; end: Date },
): ExpirationHeatmap {
  const firstWeekStart = startOfWeek(start, { weekStartsOn: 1 })
  const numWeeks =
    differenceInCalendarWeeks(end, firstWeekStart, { weekStartsOn: 1 }) + 1

  const monthLabels: { label: string; weekIndex: number }[] = []
  const seenMonths = new Set<number>()
  for (let week = 0; week < numWeeks; week++) {
    const weekDate = addWeeks(firstWeekStart, week)
    const monthKey = weekDate.getFullYear() * 12 + weekDate.getMonth()
    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey)
      monthLabels.push({ label: format(weekDate, "MMM"), weekIndex: week })
    }
  }

  const maxCount = Math.max(1, ...cells.map((cell) => cell.count))

  const entries = cells
    .filter((cell) => cell.count > 0)
    .map((cell) => {
      const parsed = parseISO(cell.date)

      return {
        date: cell.date,
        x: differenceInCalendarWeeks(parsed, firstWeekStart, {
          weekStartsOn: 1,
        }),
        y: getDay(parsed),
        count: cell.count,
        temperature: cell.count / maxCount,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  return { entries, numWeeks, monthLabels }
}
