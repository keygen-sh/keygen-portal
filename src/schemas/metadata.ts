import { z } from "zod"

// Values supported by the Keygen API for metadata. The API accepts any valid
// JSON, so we allow scalars (string, number, boolean, null) as well as
// arbitrarily nested objects and arrays.
export const MetadataValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(MetadataValueSchema),
    z.record(MetadataValueSchema),
  ]),
)

export type MetadataValue = z.infer<typeof MetadataValueSchema>

export const MetadataSchema = z.record(MetadataValueSchema).default({})

// The discrete set of types KeyValueInput exposes as a type-picker per row.
export const META_TYPES = [
  "string",
  "integer",
  "float",
  "boolean",
  "null",
  "json",
] as const

export type MetaType = (typeof META_TYPES)[number]

// A single row of raw user input as held in KeyValueInput's state.
export type Pair = {
  id: string
  key: string
  type: MetaType
  value: string
}

// Helper for schema input-type derivation: swaps the `metadata` field's
// output shape (Record) for its input shape (Pair[]) on form-state types.
export type WithMetadataInput<T> = T extends { metadata?: unknown }
  ? Omit<T, "metadata"> & { metadata?: Pair[] }
  : T & { metadata?: Pair[] }

// Integer: optional sign, digits, optional exponent. The exponent may resolve
// to a non-integer (e.g. `1e-1` → 0.1), which we catch separately via
// `Number.isInteger` on the parsed value.
const INTEGER_PATTERN = /^-?\d+([eE][+-]?\d+)?$/
// Float: optional sign, digits, optional fractional part, optional exponent.
const FLOAT_PATTERN = /^-?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/

function tryParseJson(raw: string): { value: unknown } | undefined {
  try {
    return { value: JSON.parse(raw) }
  } catch {
    return undefined
  }
}

// Returns a user-facing validation message for the row, or `null` when valid.
// A row is considered "empty" (and therefore non-erroring) when both key and
// value are blank — this avoids flashing errors for a brand-new row the user
// hasn't typed into yet.
export function validatePair({ key, type, value }: Pair): string | null {
  const trimmedKey = key.trim()
  const trimmedValue = value.trim()

  if (!trimmedKey && !trimmedValue && type !== "null" && type !== "boolean") {
    return null
  }

  if (!trimmedKey) {
    return "Key is required"
  }

  switch (type) {
    case "string": {
      // Empty string is a valid metadata value.
      return null
    }
    case "integer": {
      if (!trimmedValue) return "Value is required"
      if (!INTEGER_PATTERN.test(trimmedValue)) {
        return "Must be a valid integer"
      }
      const n = Number(trimmedValue)
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        return "Must be a valid integer"
      }
      return null
    }
    case "float": {
      if (!trimmedValue) return "Value is required"
      if (!FLOAT_PATTERN.test(trimmedValue)) {
        return "Must be a valid number"
      }
      const n = Number.parseFloat(trimmedValue)
      if (!Number.isFinite(n)) return "Must be a valid number"
      return null
    }
    case "json": {
      if (!trimmedValue) return "Value is required"
      const parsed = tryParseJson(trimmedValue)
      if (!parsed) return "Must be valid JSON"
      if (parsed.value === null || typeof parsed.value !== "object") {
        return "Must be a JSON object or array"
      }
      return null
    }
    case "boolean":
    case "null":
      return null
  }
}

const PairSchema: z.ZodType<Pair> = z.object({
  id: z.string(),
  key: z.string(),
  type: z.enum(META_TYPES),
  value: z.string(),
})

// Schema for the raw Pair[] state in KeyValueInput. Emits a single top-level
// issue when any row fails validation, whose message surfaces via the parent
// FormField's FormMessage so the form owns error visualization. On success it
// transforms to a Record<string, MetadataValue> — the shape the API expects —
// which means the same schema can live on form fields whose output type is a
// record (input: Pair[], output: Record).
export const MetadataPairsSchema = z
  .array(PairSchema)
  .default([])
  .superRefine((pairs, ctx) => {
    for (const [i, pair] of pairs.entries()) {
      const err = validatePair(pair)
      if (!err) continue

      const label = pair.key.trim() ? `"${pair.key.trim()}"` : `#${i + 1}`
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Row ${label}: ${err.charAt(0).toLowerCase() + err.slice(1)}`,
        path: [],
      })
      // Surface the first offending row only; subsequent rows will validate
      // on the next edit.
      return
    }
  })
  .transform(pairsToRecord)

// Detects the MetaType of a raw metadata value from the API.
export function detectMetaType(v: unknown): MetaType {
  if (v === null) return "null"
  if (typeof v === "boolean") return "boolean"
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "float"
  if (typeof v === "object") return "json"
  return "string"
}

// Converts a raw metadata value into its input-string representation.
export function metaValueToString(v: unknown): string {
  if (v === null || v === undefined) return ""
  if (typeof v === "boolean") return v ? "true" : "false"
  if (typeof v === "number") return String(v)
  if (typeof v === "string") return v
  return JSON.stringify(v)
}

// Convert a Record into a Pair[] for initializing KeyValueInput state.
export function recordToPairs(
  entries: Record<string, unknown> | undefined | null,
): Pair[] {
  if (!entries) return []
  return Object.entries(entries).map(([key, raw], i) => ({
    id: `${i}-${key}`,
    key,
    type: detectMetaType(raw),
    value: metaValueToString(raw),
  }))
}

// Convert a Pair[] back into a Record<string, MetadataValue> for submission.
// Invalid or empty-keyed rows are dropped silently.
export function pairsToRecord(pairs: Pair[]): Record<string, MetadataValue> {
  const out: Record<string, MetadataValue> = {}
  for (const pair of pairs) {
    if (validatePair(pair) !== null) continue

    const trimmedKey = pair.key.trim()
    if (!trimmedKey) continue

    switch (pair.type) {
      case "string":
        out[trimmedKey] = pair.value.trim()
        break
      case "integer":
        out[trimmedKey] = Number(pair.value.trim())
        break
      case "float":
        out[trimmedKey] = Number.parseFloat(pair.value.trim())
        break
      case "boolean":
        out[trimmedKey] = pair.value === "true"
        break
      case "null":
        out[trimmedKey] = null
        break
      case "json": {
        const parsed = tryParseJson(pair.value)
        if (parsed) out[trimmedKey] = parsed.value
        break
      }
    }
  }
  return out
}
