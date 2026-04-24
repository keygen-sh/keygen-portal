import { z } from "zod"

// optional sign, digits, optional exponent
const INTEGER_PATTERN = /^-?\d+([eE][+-]?\d+)?$/

// optional sign, digits, optional fractional part, optional exponent
const FLOAT_PATTERN = /^-?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/

export const METADATA_TYPES = [
  "string",
  "integer",
  "float",
  "boolean",
  "null",
  "json",
] as const

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

export type MetadataType = (typeof METADATA_TYPES)[number]

export const MetadataTypeLabels: Readonly<Record<MetadataType, string>> = {
  string: "String",
  integer: "Integer",
  float: "Float",
  boolean: "Boolean",
  null: "Null",
  json: "JSON",
} as const

// a single row of raw user input as held in form state
export type MetadataPair = {
  id: string
  key: string
  type: MetadataType
  value: string
}

function tryParseJson(raw: string): { value: unknown } | undefined {
  try {
    return { value: JSON.parse(raw) }
  } catch {
    return undefined
  }
}

const MetadataPairShape = z.object({
  id: z.string(),
  key: z.string(),
  type: z.enum(METADATA_TYPES),
  value: z.string(),
})

export const MetadataPairSchema = MetadataPairShape.superRefine((pair, ctx) => {
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

export const MetadataPairsSchema = z
  .array(MetadataPairShape)
  .default([])
  .superRefine((pairs, ctx) => {
    for (const [i, pair] of pairs.entries()) {
      const result = MetadataPairSchema.safeParse(pair)
      if (result.success) {
        continue
      }

      const label = pair.key.trim() ? `"${pair.key.trim()}"` : `#${i + 1}`
      const [issue] = result.error.issues
      const message = issue.message

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: `Row ${label}: ${message}`,
      })

      // only surface the first offending issue
      return
    }
  })
  .transform(metadataPairsToRecord)

// detect the MetadataType of a raw metadata value
export function metadataValueToType(v: unknown): MetadataType {
  if (v === null) return "null"
  if (typeof v === "boolean") return "boolean"
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "float"
  if (typeof v === "object") return "json"
  return "string"
}

// convert a raw metadata value into its input-string representation
export function metadataValueToString(v: unknown): string {
  if (v === null || v === undefined) return ""
  if (typeof v === "boolean") return v ? "true" : "false"
  if (typeof v === "number") return String(v)
  if (typeof v === "string") return v
  return JSON.stringify(v)
}

// convert a metadata Record into a MetadataPair[] for initializing form field state
export function recordToMetadataPairs(
  entries: Record<string, unknown> | undefined | null,
): MetadataPair[] {
  if (!entries) {
    return []
  }

  return Object.entries(entries).map(([key, raw], i) => ({
    id: `${i}-${key}`,
    key,
    type: metadataValueToType(raw),
    value: metadataValueToString(raw),
  }))
}

// convert a MetadataPair[] into a Record<string, MetadataValue> for serialization
function metadataPairsToRecord(
  pairs: MetadataPair[],
): Record<string, MetadataValue> {
  const out: Record<string, MetadataValue> = {}

  for (const pair of pairs) {
    const trimmedKey = pair.key.trim()
    if (!trimmedKey) {
      continue
    }

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
        if (parsed) {
          out[trimmedKey] = parsed.value
        }

        break
      }
    }
  }

  return out
}
