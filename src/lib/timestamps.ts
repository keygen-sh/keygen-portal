import {
  type Duration,
  formatDuration,
  intervalToDuration,
  formatDistanceToNowStrict,
} from "date-fns"

// non-precise relative time format, e.g. "2 days ago" or "in 3 months"
export function formatRelativeTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return formatDistanceToNowStrict(date, { addSuffix: true })
}

// precise relative time format, e.g. "2 days, 3 hours ago" or "in 3 months, 2 days"
export function formatPreciseRelative(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const now = new Date()
  const future = date.getTime() > now.getTime()
  const duration = intervalToDuration(
    future ? { start: now, end: date } : { start: date, end: now },
  )

  const units = [
    "years",
    "months",
    "days",
    "hours",
    "minutes",
    "seconds",
  ] as const
  const present = units.filter((unit) => duration[unit])
  const format: (keyof Duration)[] = present.length
    ? present.slice(0, 2)
    : ["seconds"]
  const body =
    formatDuration(duration, { format, delimiter: ", " }) || "0 seconds"

  return future ? `in ${body}` : `${body} ago`
}

export type ZonedTimestamp = {
  label: string
  date: string
  time: string
}

// formats an ISO timestamp as a date and time in a given time zone
// e.g. "January 1, 2023, 12:00:00 AM"
function formatZonedTimestamp(
  value: string,
  timeZone: string,
  label: string,
): ZonedTimestamp {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return {
      label,
      date: value,
      time: "",
    }
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(date)

  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return {
    label,
    date: `${valueFor("month")} ${valueFor("day")}, ${valueFor("year")}`,
    time:
      [valueFor("hour"), valueFor("minute"), valueFor("second")].join(":") +
      ` ${valueFor("dayPeriod")}`,
  }
}

// formats an ISO timestamp as a UTC date and time
// e.g. "January 1, 2023, 12:00:00 AM"
export function formatUtcTimestamp(value: string): ZonedTimestamp {
  return formatZonedTimestamp(value, "UTC", "UTC")
}

// local time zone abbreviation, e.g. "CST" or "EDT"
function localTimeZoneAbbreviation(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  }).formatToParts(date)

  return parts.find((part) => part.type === "timeZoneName")?.value ?? "Local"
}

// formats an ISO timestamp as a local date and time
// e.g. "January 1, 2023, 12:00:00 AM"
export function formatLocalTimestamp(value: string): ZonedTimestamp {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return {
      label: "Local",
      date: value,
      time: "",
    }
  }

  return formatZonedTimestamp(value, timeZone, localTimeZoneAbbreviation(date))
}

// utc date formatter, e.g. "01/01/2023"
const utcDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
})

// formats an ISO timestamp as a UTC date, e.g. "01/01/2023"
export function formatUtcDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return utcDateFormatter.format(date)
}

// formats a start/end ISO range as UTC dates, e.g. "01/01/2023 - 01/31/2023"
export function formatRange(
  start?: string | null,
  end?: string | null,
): string | null {
  if (!start || !end) return null

  return `${formatUtcDate(start)} - ${formatUtcDate(end)}`
}
