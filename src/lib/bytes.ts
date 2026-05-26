type ByteFormatOptions = {
  emptyLabel?: string
}

type ByteLimitFormatOptions = ByteFormatOptions & {
  compactZeroCurrent?: boolean
}

export function formatByteSize(
  bytes: number | null | undefined,
  { emptyLabel = "--" }: ByteFormatOptions = {},
): string {
  if (bytes == null) return emptyLabel

  const units = ["B", "KB", "MB", "GB", "TB", "PB"]
  let value = bytes
  let unit = 0

  while (Math.abs(value) >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }

  const formatted =
    unit === 0 || Number.isInteger(value) ? String(value) : value.toFixed(1)

  return `${formatted} ${units[unit]}`
}

export function formatRawByteSize(
  bytes: number | null | undefined,
  { emptyLabel = "--" }: ByteFormatOptions = {},
): string {
  if (bytes == null) return emptyLabel

  const formatted = bytes.toLocaleString("en-US")

  return `${formatted} ${Math.abs(bytes) === 1 ? "byte" : "bytes"}`
}

export function formatByteLimitDisplay(
  current: number,
  max: number | null | undefined,
  { emptyLabel = "unlimited" }: ByteFormatOptions = {},
): string {
  return `${formatByteSize(current)} of ${formatByteSize(max, { emptyLabel })}`
}

export function formatRawByteLimitDisplay(
  current: number,
  max: number | null | undefined,
  {
    emptyLabel = "unlimited",
    compactZeroCurrent = false,
  }: ByteLimitFormatOptions = {},
): string {
  const currentValue =
    compactZeroCurrent && current === 0 ? "0" : formatRawByteSize(current)

  return `${currentValue} of ${formatRawByteSize(max, { emptyLabel })}`
}
