import { useState, useRef, useMemo, useEffect } from "react"
import {
  useController,
  useFormContext,
  FieldPath,
  FieldValues,
} from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type MetaType = "string" | "integer" | "float" | "boolean" | "null" | "json"

type Pair = {
  id: string
  key: string
  type: MetaType
  value: string
}

type MetadataValue = string | number | boolean | null | unknown[] | object

const TYPE_OPTIONS: { value: MetaType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "float", label: "Float" },
  { value: "boolean", label: "Boolean" },
  { value: "null", label: "Null" },
  { value: "json", label: "JSON" },
]

// Integer: optional sign, digits, optional exponent. The exponent may resolve
// to a non-integer (e.g. `1e-1` → 0.1), which we catch separately via
// `Number.isInteger` on the parsed value.
const INTEGER_PATTERN = /^-?\d+([eE][+-]?\d+)?$/
// Float: optional sign, digits, optional fractional part, optional exponent.
const FLOAT_PATTERN = /^-?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/

function detectType(v: unknown): MetaType {
  if (v === null) return "null"
  if (typeof v === "boolean") return "boolean"
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "float"
  if (typeof v === "object") return "json"
  return "string"
}

function toInputString(v: unknown): string {
  if (v === null || v === undefined) return ""
  if (typeof v === "boolean") return v ? "true" : "false"
  if (typeof v === "number") return String(v)
  if (typeof v === "string") return v
  return JSON.stringify(v)
}

// Attempts to parse a string as JSON, returning `undefined` on failure.
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
function validateRow({ key, type, value }: Pair): string | null {
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

// Parse an input row into its underlying metadata value for submission.
// Returns null when the row is invalid or empty.
function parseRow({
  key,
  type,
  value,
}: Pair): { key: string; value: MetadataValue } | null {
  if (validateRow({ id: "", key, type, value }) !== null) return null

  const trimmedKey = key.trim()
  // A blank key is treated as an untyped/empty row and should not be
  // committed, even when the row itself passes validation (e.g. a brand-new
  // row where both fields are empty).
  if (!trimmedKey) return null

  switch (type) {
    case "string":
      return { key: trimmedKey, value: value.trim() }
    case "integer":
      return { key: trimmedKey, value: Number(value.trim()) }
    case "float":
      return { key: trimmedKey, value: Number.parseFloat(value.trim()) }
    case "boolean":
      return { key: trimmedKey, value: value === "true" }
    case "null":
      return { key: trimmedKey, value: null }
    case "json": {
      const parsed = tryParseJson(value)
      if (!parsed) return null
      return { key: trimmedKey, value: parsed.value as MetadataValue }
    }
  }
}

function entriesToRows(
  entries: Record<string, unknown> | undefined | null,
): Pair[] {
  if (!entries) return []
  return Object.entries(entries).map(([key, raw], i) => ({
    id: `${i}-${key}`,
    key,
    type: detectType(raw),
    value: toInputString(raw),
  }))
}

interface KeyValueInputProps<TFormValues extends FieldValues> {
  name: FieldPath<TFormValues>
  addLabel?: string
  keyPlaceholder?: string
  valuePlaceholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export default function KeyValueInput<
  TFormValues extends Record<string, unknown>,
>({
  name,
  addLabel = "New Key/Value Pair",
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  disabled,
  autoFocus,
  className,
}: KeyValueInputProps<TFormValues>): React.ReactElement {
  const { field } = useController<TFormValues, FieldPath<TFormValues>>({ name })
  const formContext = useFormContext<TFormValues>()

  const [rows, setRows] = useState<Pair[]>(() =>
    entriesToRows(field.value as Record<string, unknown> | undefined),
  )

  const lastValueRef = useRef<string | null>(null)
  const value = useMemo(() => JSON.stringify(field.value ?? {}), [field.value])

  if (value !== lastValueRef.current) {
    lastValueRef.current = value

    setRows(entriesToRows(field.value as Record<string, unknown> | undefined))
  }

  // Per-row validation results, recomputed whenever rows change.
  const rowErrors = useMemo(() => {
    const map = new Map<string, string | null>()
    for (const row of rows) map.set(row.id, validateRow(row))
    return map
  }, [rows])

  const hasErrors = Array.from(rowErrors.values()).some((e) => e !== null)

  // Clear the error on unmount so a stale manual error doesn't persist.
  useEffect(() => {
    return () => {
      formContext?.clearErrors(name)
    }
  }, [formContext, name])

  // Surface a field-level error on the parent form when any row is invalid so
  // the form submit is blocked and the user gets a consistent validation
  // signal. Called at every row mutation site below.
  const syncFormError = (draft: Pair[]) => {
    if (!formContext) return

    const invalid = draft.some((row) => validateRow(row) !== null)
    if (invalid) {
      formContext.setError(name, {
        type: "manual",
        message: "Metadata contains invalid values",
      })
    } else {
      formContext.clearErrors(name)
    }
  }

  const commit = (draft: Pair[] = rows) => {
    const entries: Record<string, MetadataValue> = {}

    for (const row of draft) {
      const parsed = parseRow(row)
      if (parsed) entries[parsed.key] = parsed.value
    }

    const next = JSON.stringify(entries)

    if (next !== value) {
      lastValueRef.current = next
      field.onChange(entries)
    }

    syncFormError(draft)
  }

  const addRow = () => {
    const id = crypto.randomUUID()

    setRows((prev) => [...prev, { id, key: "", type: "string", value: "" }])

    requestAnimationFrame(() =>
      document.getElementById(`key-value-key-${id}`)?.focus(),
    )
  }

  const updateRow = (
    id: string,
    changes: Partial<Pick<Pair, "key" | "type" | "value">>,
  ) => {
    setRows((prev) => {
      const next = prev.map((row) =>
        row.id === id ? { ...row, ...changes } : row,
      )
      syncFormError(next)
      return next
    })
  }

  const changeType = (id: string, type: MetaType) => {
    setRows((prev) => {
      const next = prev.map((row) => {
        if (row.id !== id) return row
        // Reset value to a sensible default when switching to types that
        // have a constrained value space, or when crossing the json boundary
        // (where the existing text is unlikely to be meaningful in the new
        // type).
        let nextValue = row.value
        if (type === "boolean") {
          nextValue = row.value === "true" ? "true" : "false"
        } else if (type === "null") {
          nextValue = ""
        } else if (type === "json" && row.type !== "json") {
          nextValue = ""
        } else if (row.type === "json" && type !== "json") {
          nextValue = ""
        }

        return { ...row, type, value: nextValue }
      })

      queueMicrotask(() => commit(next))

      return next
    })
  }

  const deleteRow = (id: string, usingKeys: boolean) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id)
      queueMicrotask(() => commit(next))

      return next
    })

    if (usingKeys)
      requestAnimationFrame(() =>
        document.getElementById("key-value-add")?.focus(),
      )
  }

  const canAdd = !hasErrors

  return (
    <div className={cn("space-y-2", className)}>
      {rows.length === 0 ? (
        <Button
          id="key-value-add"
          size="sm"
          type="button"
          variant="ghost"
          onClick={addRow}
          disabled={disabled}
          className="text-content-muted"
        >
          + {addLabel}
        </Button>
      ) : (
        <>
          {rows.map(({ id, key, type, value }) => {
            const error = rowErrors.get(id) ?? null

            return (
              <div key={id} className="space-y-1">
                <div className="flex items-start gap-2">
                  <Input
                    id={`key-value-key-${id}`}
                    placeholder={keyPlaceholder}
                    value={key}
                    onChange={(e) => updateRow(id, { key: e.target.value })}
                    onBlur={() => commit()}
                    disabled={disabled}
                    aria-invalid={error && !key.trim() ? true : undefined}
                  />
                  <Select
                    value={type}
                    onValueChange={(next) => changeType(id, next as MetaType)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-28 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {type === "null" ? (
                    <Input
                      value="null"
                      disabled
                      readOnly
                      className="font-mono text-content-muted"
                    />
                  ) : type === "boolean" ? (
                    <Select
                      value={value === "true" ? "true" : "false"}
                      onValueChange={(next) => {
                        setRows((prev) => {
                          const nextRows = prev.map((row) =>
                            row.id === id ? { ...row, value: next } : row,
                          )
                          queueMicrotask(() => commit(nextRows))
                          return nextRows
                        })
                      }}
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">true</SelectItem>
                        <SelectItem value="false">false</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : type === "json" ? (
                    <Textarea
                      placeholder='e.g. { "nested": true }'
                      value={value}
                      onChange={(e) => updateRow(id, { value: e.target.value })}
                      onBlur={() => commit()}
                      disabled={disabled}
                      spellCheck={false}
                      rows={1}
                      className="field-sizing-fixed h-9 min-h-9 resize-y py-1.5 font-mono text-xs"
                      aria-invalid={
                        error && key.trim().length > 0 ? true : undefined
                      }
                    />
                  ) : (
                    <Input
                      placeholder={valuePlaceholder}
                      value={value}
                      onChange={(e) => updateRow(id, { value: e.target.value })}
                      onBlur={() => commit()}
                      disabled={disabled}
                      inputMode={
                        type === "integer"
                          ? "numeric"
                          : type === "float"
                            ? "decimal"
                            : undefined
                      }
                      aria-invalid={
                        error && key.trim().length > 0 ? true : undefined
                      }
                    />
                  )}
                  <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={(e) => deleteRow(id, e.detail === 0)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4 stroke-content-subdued" />
                  </Button>
                </div>
                {error ? (
                  <p className="pl-1 text-xs text-destructive">{error}</p>
                ) : null}
              </div>
            )
          })}

          <Button
            id="key-value-add"
            size="sm"
            type="button"
            variant="ghost"
            onClick={addRow}
            autoFocus={autoFocus}
            disabled={!canAdd || disabled}
            className="text-content-muted"
          >
            + {addLabel}
          </Button>
        </>
      )}
    </div>
  )
}
