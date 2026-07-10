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
