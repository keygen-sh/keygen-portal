import { format, formatDistanceToNowStrict } from "date-fns"

export function formatRelativeTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return formatDistanceToNowStrict(date, { addSuffix: true })
}

export function formatTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return format(date, "PP p")
}

export type ZonedTimestamp = {
  label: string
  date: string
  time: string
}

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

export function formatUtcTimestamp(value: string): ZonedTimestamp {
  return formatZonedTimestamp(value, "UTC", "UTC")
}

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

  return formatZonedTimestamp(value, timeZone, "Local")
}
