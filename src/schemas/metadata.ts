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

const PairShape = z.object({
  id: z.string(),
  key: z.string(),
  type: z.enum(META_TYPES),
  value: z.string(),
})

// Validates a single Pair, attaching issues to the offending field (`key` or
// `value`) so callers can reason about per-field validity via safeParse. A
// fully-blank row (no key, no value) is treated as "not yet filled in" and
// produces no issues — this avoids flashing errors on a freshly-added row.
export const PairSchema = PairShape.superRefine((pair, ctx) => {
  const trimmedKey = pair.key.trim()
  const trimmedValue = pair.value.trim()

  if (
    !trimmedKey &&
    !trimmedValue &&
    pair.type !== "null" &&
    pair.type !== "boolean"
  ) {
    return
  }

  if (!trimmedKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["key"],
      message: "Key is required",
    })
  }

  switch (pair.type) {
    case "string":
    case "boolean":
    case "null":
      return
    case "integer": {
      if (!trimmedValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value is required",
        })
        return
      }
      const n = Number(trimmedValue)
      if (
        !INTEGER_PATTERN.test(trimmedValue) ||
        !Number.isFinite(n) ||
        !Number.isInteger(n)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Must be a valid integer",
        })
      }
      return
    }
    case "float": {
      if (!trimmedValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value is required",
        })
        return
      }
      const n = Number.parseFloat(trimmedValue)
      if (!FLOAT_PATTERN.test(trimmedValue) || !Number.isFinite(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Must be a valid number",
        })
      }
      return
    }
    case "json": {
      if (!trimmedValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value is required",
        })
        return
      }
      const parsed = tryParseJson(trimmedValue)
      if (!parsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Must be valid JSON",
        })
        return
      }
      if (parsed.value === null || typeof parsed.value !== "object") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Must be a JSON object or array",
        })
      }
      return
    }
  }
})

// Schema for the raw Pair[] state in KeyValueInput. Aggregates the first
// per-row failure into a top-level issue whose message surfaces via the
// parent FormField's FormMessage. On success it transforms to a
// Record<string, MetadataValue> — the shape the API expects — so the same
// schema can live on form fields whose output type is a record (input:
// Pair[], output: Record).
export const MetadataPairsSchema = z
  .array(PairShape)
  .default([])
  .superRefine((pairs, ctx) => {
    for (const [i, pair] of pairs.entries()) {
      const result = PairSchema.safeParse(pair)
      if (result.success) continue

      const label = pair.key.trim() ? `"${pair.key.trim()}"` : `#${i + 1}`
      const firstMessage = result.error.issues[0].message
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: `Row ${label}: ${firstMessage.charAt(0).toLowerCase() + firstMessage.slice(1)}`,
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

// Convert a Pair[] into a Record<string, MetadataValue> for submission. Runs
// as the MetadataPairsSchema transform, which only executes after per-pair
// refinement has passed — so every pair here is already well-formed. Empty-
// keyed rows (blank throwaway rows the user left unfilled) are dropped.
function pairsToRecord(pairs: Pair[]): Record<string, MetadataValue> {
  const out: Record<string, MetadataValue> = {}
  for (const pair of pairs) {
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
