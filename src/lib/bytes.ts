type ByteFormatOptions = {
  emptyLabel?: string
}

type ByteLimitFormatOptions = ByteFormatOptions & {
  compactZeroCurrent?: boolean
}

export const BYTE_UNITS = [
  { key: "B", label: "Bytes", bytes: 1 },
  { key: "KB", label: "KB", bytes: 1024 },
  { key: "MB", label: "MB", bytes: 1024 ** 2 },
  { key: "GB", label: "GB", bytes: 1024 ** 3 },
  { key: "TB", label: "TB", bytes: 1024 ** 4 },
  { key: "PB", label: "PB", bytes: 1024 ** 5 },
] as const

export type ByteUnit = (typeof BYTE_UNITS)[number]
export type ByteUnitKey = ByteUnit["key"]

export function findByteUnit(key: ByteUnitKey): ByteUnit {
  return BYTE_UNITS.find((unit) => unit.key === key) ?? BYTE_UNITS[0]
}

export function selectByteUnit(
  bytes?: number | null,
  defaultUnit: ByteUnitKey = "GB",
): ByteUnit {
  if (bytes == null || bytes === 0) return findByteUnit(defaultUnit)

  const absoluteBytes = Math.abs(bytes)
  for (let i = BYTE_UNITS.length - 1; i >= 0; i--) {
    if (absoluteBytes >= BYTE_UNITS[i].bytes) return BYTE_UNITS[i]
  }

  return BYTE_UNITS[0]
}

export function formatByteUnitValue(
  bytes: number | null | undefined,
  unit: ByteUnit,
): string {
  if (bytes == null) return ""

  const value = bytes / unit.bytes
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)))
}

export function formatByteSize(
  bytes: number | null | undefined,
  { emptyLabel = "--" }: ByteFormatOptions = {},
): string {
  if (bytes == null) return emptyLabel

  const unit = selectByteUnit(bytes, "B")
  const value = bytes / unit.bytes

  const formatted =
    unit.key === "B" || Number.isInteger(value)
      ? String(value)
      : value.toFixed(1)

  return `${formatted} ${unit.key}`
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
