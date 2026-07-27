import { formatDuration, type Duration } from "date-fns"

export const SECONDS_PER_MINUTE = 60
export const SECONDS_PER_HOUR = 3600
export const SECONDS_PER_DAY = 86400
export const SECONDS_PER_WEEK = 604800
export const SECONDS_PER_MONTH = 2629746
export const SECONDS_PER_YEAR = 31556952

const ISO_DURATION_RE =
  /P(?:([\d]+\.?[\d]*|\.[\d]+)Y)?(?:([\d]+\.?[\d]*|\.[\d]+)M)?(?:([\d]+\.?[\d]*|\.[\d]+)W)?(?:([\d]+\.?[\d]*|\.[\d]+)D)?(?:T(?:([\d]+\.?[\d]*|\.[\d]+)H)?(?:([\d]+\.?[\d]*|\.[\d]+)M)?(?:([\d]+\.?[\d]*|\.[\d]+)S)?)?$/

// FIXME(ezekg) will it ever be merged? https://github.com/date-fns/date-fns/pull/3151
export function parseISODuration(isoDuration: string): Duration {
  const match = isoDuration?.match(ISO_DURATION_RE) ?? []

  const [
    ,
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  ] = match

  const entries = Object.entries({
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
  }) as [keyof Duration, string][]

  return entries.reduce<Duration>((obj, [key, value]) => {
    obj[key] = +value

    return obj
  }, {})
}

type DurationFormatOptions = {
  emptyLabel?: string
}

const DURATION_UNITS: [keyof Duration, number][] = [
  ["years", SECONDS_PER_YEAR],
  ["months", SECONDS_PER_MONTH],
  ["weeks", SECONDS_PER_WEEK],
  ["days", SECONDS_PER_DAY],
  ["hours", SECONDS_PER_HOUR],
  ["minutes", SECONDS_PER_MINUTE],
  ["seconds", 1],
]

const EXACT_UNITS = DURATION_UNITS.filter(
  ([unit]) => unit !== "years" && unit !== "months",
)

// convert a number of seconds into a whole number of seconds
export function toSeconds(total?: number | null): number | null {
  if (total == null || !Number.isFinite(total)) return null

  const seconds = Math.floor(total)

  return seconds > 0 ? seconds : null
}

// break a number of seconds down into its component units
// e.g. 1234567 seconds would return { days: 14, hours: 6, minutes: 56, seconds: 7 }
function decompose(
  seconds: number,
  units: [keyof Duration, number][],
): Duration {
  let remaining = seconds
  const parts: Duration = {}

  for (const [unit, size] of units) {
    const count = Math.trunc(remaining / size)
    if (count > 0) {
      parts[unit] = count
      remaining -= count * size
    }
  }

  return parts
}

// find the index of the smallest unit that has a non-zero value,
// e.g. { days: 1, hours: 2, minutes: 3 } would return 2 for minutes
function smallestUnitIndex(parts: Duration): number {
  for (let i = DURATION_UNITS.length - 1; i >= 0; i--) {
    if (parts[DURATION_UNITS[i][0]]) return i
  }

  return -1
}

function secondsToParts(seconds: number): Duration {
  // when the value is a whole number of a single unit, show just
  // that unit so it reads back the way it was entered, e.g. 1 year
  for (const [unit, size] of DURATION_UNITS) {
    if (size > 1 && seconds % size === 0) {
      const part: Duration = {}
      part[unit] = seconds / size
      return part
    }
  }

  // otherwise break it down across units
  return decompose(seconds, DURATION_UNITS)
}

function secondsToFullParts(seconds: number): Duration {
  const calendar = decompose(seconds, DURATION_UNITS)
  const exact = decompose(seconds, EXACT_UNITS)

  // keep years and months unless dropping them reads more clearly,
  // e.g. 1 year, 2 months, 3 days vs 14 months, 3 days
  return smallestUnitIndex(exact) < smallestUnitIndex(calendar)
    ? exact
    : calendar
}

// compact duration, e.g. 2 weeks
export function formatCompactDurationLabel(
  total?: number | null,
  { emptyLabel = "--" }: DurationFormatOptions = {},
): string {
  const seconds = toSeconds(total)
  if (seconds == null) return emptyLabel

  return formatDuration(secondsToParts(seconds), { zero: false })
}

// full duration, e.g. 1 year, 2 months, 3 days, 4 hours, 5 minutes, 6 seconds
export function formatFullDurationLabel(
  total?: number | null,
  { emptyLabel = "--" }: DurationFormatOptions = {},
): string {
  const seconds = toSeconds(total)
  if (seconds == null) return emptyLabel

  return formatDuration(secondsToFullParts(seconds), {
    zero: false,
    delimiter: ", ",
  })
}

// seconds pluralization, e.g. 1 second vs 2 seconds
export function secondsLabel(seconds: number): string {
  return seconds === 1 ? "second" : "seconds"
}
