import { DateRangeOptions } from "@/types/analytics"

export function dateRangeParams({ start, end }: DateRangeOptions = {}) {
  const params = new URLSearchParams()

  if (start != null) {
    params.set("date[start]", start)
  }

  if (end != null) {
    params.set("date[end]", end)
  }

  return params
}
