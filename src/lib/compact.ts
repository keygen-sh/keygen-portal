export type Compact<T> = T extends (infer U)[]
  ? NonNullable<U>[]
  : T extends object
    ? { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] }
    : T

export function compact<T>(value: (T | null | undefined)[]): NonNullable<T>[]
export function compact<T extends object>(value: T): Compact<T>
export function compact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return (value as unknown[]).filter(
      (item): item is NonNullable<typeof item> => item != null,
    )
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {}

    for (const [key, val] of Object.entries(value)) {
      if (val != null && val !== 0) {
        result[key] = val
      }
    }

    return result
  }

  throw new TypeError("compact() expects an array or object")
}
