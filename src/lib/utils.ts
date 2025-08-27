import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (
    a === null ||
    b === null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }

    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false

  for (const k of keysA) {
    if (!keysB.includes(k) || !deepEqual(a[k], b[k])) return false
  }
  return true
}

export function diff<T extends object>(
  original: T,
  edited: Partial<T>,
): Partial<T> {
  const changed: Partial<T> = {}

  for (const [key, value] of Object.entries(edited)) {
    if (value === undefined) continue

    if (!deepEqual(value, (original as any)[key])) {
      ;(changed as any)[key] = value
    }
  }
  return changed
}

export function formatDate(
  input: string | number | Date,
  options?: { timeZone?: string },
): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: options?.timeZone,
  }).format(new Date(input))
}
