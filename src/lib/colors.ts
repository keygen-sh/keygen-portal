export function mix({
  baseColor,
  mixedColor,
  mixedColorAmount,
}: {
  baseColor: string
  mixedColor: string
  mixedColorAmount: number
}) {
  return `color-mix(in oklch, ${baseColor} ${100 - mixedColorAmount}%, ${mixedColor} ${mixedColorAmount}%)`
}
