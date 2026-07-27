import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deepEqual(a: unknown, b: unknown): boolean {
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
    if (
      !keysB.includes(k) ||
      !deepEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      )
    )
      return false
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

    if (!deepEqual(value, original[key as keyof T])) {
      changed[key as keyof T] = value as T[keyof T]
    }
  }
  return changed
}

export function humanize(input: string) {
  if (!input) return ""
  let string = input.replace(/[_\-\s]+/g, " ").trim()

  if (/^[^a-z]*$/.test(input)) string = string.toLowerCase()

  string = string
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()

  return string.replace(/\b\w/g, (character) => character.toUpperCase())
}

export function titleCase(s: string): string {
  return s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function dasherize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^ -~]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function labelize(value?: string | null, map?: Record<string, string>) {
  if (!value) return "--"
  return (map && map[value]) || titleCase(value)
}

export function splitLastWord(s: string): { head: string; tail: string } {
  const i = s.trimEnd().lastIndexOf(" ")
  if (i === -1) return { head: "", tail: s }
  return { head: s.slice(0, i), tail: s.slice(i + 1) }
}
