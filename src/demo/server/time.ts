export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const WEEK = 7 * DAY

export function nowIso(): string {
  return new Date().toISOString()
}

export function iso(value: Date | number | string): string {
  return new Date(value).toISOString()
}

export function millis(
  value: Date | number | string | null | undefined,
): number | null {
  if (value == null) return null
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? null : parsed
}

export function shift(value: Date | number | string, byMillis: number): string {
  return new Date(new Date(value).getTime() + byMillis).toISOString()
}

export function ago(byMillis: number): string {
  return new Date(Date.now() - byMillis).toISOString()
}

export function fromNow(byMillis: number): string {
  return new Date(Date.now() + byMillis).toISOString()
}

export function dateOnly(value: Date | number | string): string {
  return new Date(value).toISOString().slice(0, 10)
}

export function startOfDay(date: string): number {
  return Date.parse(`${date}T00:00:00.000Z`)
}

export function endOfDay(date: string): number {
  return Date.parse(`${date}T23:59:59.999Z`)
}

const DURATION_PATTERN =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/

export function parseDuration(value: string): number | null {
  const match = DURATION_PATTERN.exec(value)
  if (!match) return null

  const [, years, months, weeks, days, hours, minutes, seconds] = match
  return (
    Number(years ?? 0) * 365 * DAY +
    Number(months ?? 0) * 30 * DAY +
    Number(weeks ?? 0) * WEEK +
    Number(days ?? 0) * DAY +
    Number(hours ?? 0) * HOUR +
    Number(minutes ?? 0) * MINUTE +
    Number(seconds ?? 0) * SECOND
  )
}

export const CheckInIntervalMillis: Readonly<Record<string, number>> = {
  day: DAY,
  week: WEEK,
  month: 30 * DAY,
  year: 365 * DAY,
}
