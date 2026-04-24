import { formatDate } from "date-fns"

export const DATE_FORMAT = "MM/dd/yyyy"

export function formatRange(
  start?: string | null,
  end?: string | null,
): string | null {
  if (!start || !end) return null

  return `${formatDate(new Date(start), DATE_FORMAT)} - ${formatDate(
    new Date(end),
    DATE_FORMAT,
  )}`
}

export function formatPrice(
  price: number | null,
  interval: string | null,
): string {
  if (price == null) return "Custom"
  if (price === 0) return "Free"

  const amount = (price / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  })

  return interval ? `${amount} / ${interval}` : amount
}
