export type TruncateStyle = "clip" | "start" | "middle" | "end"

type TruncateOptions = {
  maxLength?: number
}

function truncateStart(
  value: string,
  { maxLength = 64 }: TruncateOptions = {},
): string {
  if (value.length <= maxLength) return value

  const tail = value.slice(-maxLength)

  return `…${tail}`
}

function truncateMiddle(
  value: string,
  { maxLength = 64 }: TruncateOptions = {},
): string {
  if (value.length <= maxLength) return value

  const head = value.slice(0, Math.ceil(maxLength / 2))
  const tail = value.slice(-Math.floor(maxLength / 2))

  return `${head}…${tail}`
}

function truncateEnd(
  value: string,
  { maxLength = 64 }: TruncateOptions = {},
): string {
  if (value.length <= maxLength) return value

  const head = value.slice(0, maxLength)

  return `${head}…`
}

function truncateClip(
  value: string,
  { maxLength = 64 }: TruncateOptions = {},
): string {
  if (value.length <= maxLength) return value

  return value.slice(0, maxLength)
}

export function truncator(
  style: TruncateStyle,
  options: TruncateOptions = {},
): (value: string) => string {
  switch (style) {
    case "clip":
      return (v: string) => truncateClip(v, options)
    case "start":
      return (v: string) => truncateStart(v, options)
    case "middle":
      return (v: string) => truncateMiddle(v, options)
    case "end":
      return (v: string) => truncateEnd(v, options)
  }
}
