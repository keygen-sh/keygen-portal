import { format, formatDistanceToNowStrict } from "date-fns"

import { type DiffEntry } from "@/components/diff"

export function formatEventLogRelativeTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return formatDistanceToNowStrict(date, { addSuffix: true })
}

export function formatEventLogTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return format(date, "PP p")
}

export type EventLogZonedTimestamp = {
  label: string
  date: string
  time: string
}

function formatEventLogZonedTimestamp(
  value: string,
  timeZone: string,
  label: string,
): EventLogZonedTimestamp {
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

export function formatEventLogUtcTimestamp(
  value: string,
): EventLogZonedTimestamp {
  return formatEventLogZonedTimestamp(value, "UTC", "UTC")
}

export function formatEventLogLocalTimestamp(
  value: string,
): EventLogZonedTimestamp {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return {
      label: "Local",
      date: value,
      time: "",
    }
  }

  return formatEventLogZonedTimestamp(value, timeZone, "Local")
}

export function visibleMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => key !== "diff"),
  )
}

export function metadataDiffEntries(
  metadata: Record<string, unknown>,
): DiffEntry[] {
  const diff = metadata.diff
  if (!diff || typeof diff !== "object" || Array.isArray(diff)) return []

  return Object.entries(diff as Record<string, unknown>).map(([key, value]) => {
    const [before = null, after = null] = Array.isArray(value)
      ? value
      : [null, value]

    return { key, before, after }
  })
}
