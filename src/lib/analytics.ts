import {
  format,
  getDay,
  addWeeks,
  parseISO,
  startOfWeek,
  differenceInCalendarWeeks,
} from "date-fns"

import { ExpirationHeatmapEntry, ExpirationHeatmap } from "@/types/analytics"

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
