const ISO_DURATION_PATTERN =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/

export function isoToHumanDuration(iso: string): string {
  if (!iso) return ""
  const match = iso.match(ISO_DURATION_PATTERN)
  if (!match) return iso
  const [, y, mo, w, d, h, min, s] = match
  if (y) return `${y} ${parseInt(y) === 1 ? "year" : "years"}`
  if (mo) return `${mo} ${parseInt(mo) === 1 ? "month" : "months"}`
  if (w) return `${w} ${parseInt(w) === 1 ? "week" : "weeks"}`
  if (d) return `${d} ${parseInt(d) === 1 ? "day" : "days"}`
  if (h) return `${h} ${parseInt(h) === 1 ? "hour" : "hours"}`
  if (min) return `${min} ${parseInt(min) === 1 ? "minute" : "minutes"}`
  if (s) return `${s} ${parseInt(s) === 1 ? "second" : "seconds"}`
  return iso
}
