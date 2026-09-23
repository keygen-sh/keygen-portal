import { isRecord } from "./context"

export function text(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

export const stringOrNull = text

export function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const entries: unknown[] = value
  if (!entries.every((entry): entry is string => typeof entry === "string")) {
    return null
  }
  return entries
}

export function receivedType(value: unknown): string {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "float"
  }
  if (typeof value === "object") return "hash"
  return typeof value
}

export function countKeys(value: unknown): number {
  if (Array.isArray(value)) {
    const items: unknown[] = value
    return items.reduce<number>((sum, item) => sum + countKeys(item), 0)
  }
  if (!isRecord(value)) return 0
  return Object.values(value).reduce<number>(
    (sum, item) => sum + countKeys(item),
    Object.keys(value).length,
  )
}

export function underscore(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase()
}
