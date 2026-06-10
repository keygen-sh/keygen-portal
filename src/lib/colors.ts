type MixOptions = {
  color: string
  with: string
  amount: number
}

export function mix({ color, with: color2, amount }: MixOptions) {
  return `color-mix(in oklch, ${color} ${100 - amount}%, ${color2} ${amount}%)`
}
