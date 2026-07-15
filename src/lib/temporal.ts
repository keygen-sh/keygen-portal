import type { Duration } from "date-fns"

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
