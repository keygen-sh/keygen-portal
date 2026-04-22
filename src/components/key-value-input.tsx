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

import {
  MetadataPairsSchema,
  META_TYPES,
  pairsToRecord,
  recordToPairs,
  validatePair,
  type MetaType,
  type Pair,
} from "@/schemas/metadata"

import { cn } from "@/lib/utils"

const TYPE_OPTIONS: { value: MetaType; label: string }[] = META_TYPES.map(
  (t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
  }),
)

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
    recordToPairs(field.value as Record<string, unknown> | undefined),
  )

  const lastValueRef = useRef<string | null>(null)
  const value = useMemo(() => JSON.stringify(field.value ?? {}), [field.value])

  if (value !== lastValueRef.current) {
    lastValueRef.current = value

    setRows(recordToPairs(field.value as Record<string, unknown> | undefined))
  }

  // Clear the error on unmount so a stale manual error doesn't persist.
  useEffect(() => {
    return () => {
      formContext?.clearErrors(name)
    }
  }, [formContext, name])

  // Run the full zod schema over the current rows. The schema owns the
  // per-row validation logic; we translate its first issue into a form-level
  // error so the parent FormField's FormMessage can display it consistently
  // with every other validated field — no inline row errors needed.
  const syncFormError = (draft: Pair[]) => {
    if (!formContext) return

    const result = MetadataPairsSchema.safeParse(draft)
    if (result.success) {
      formContext.clearErrors(name)
    } else {
      const message =
        result.error.issues[0]?.message ?? "Metadata contains invalid values"
      formContext.setError(name, { type: "manual", message })
    }
  }

  const commit = (draft: Pair[] = rows) => {
    const entries = pairsToRecord(draft)
    const next = JSON.stringify(entries)

    if (next !== value) {
      lastValueRef.current = next
      field.onChange(entries)
    }

    syncFormError(draft)
  }

  const hasErrors = useMemo(
    () => rows.some((row) => validatePair(row) !== null),
    [rows],
  )

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
            const invalid = validatePair({ id, key, type, value }) !== null
            const keyInvalid = invalid && !key.trim()
            const valueInvalid = invalid && key.trim().length > 0

            return (
              <div key={id} className="flex items-start gap-2">
                <Input
                  id={`key-value-key-${id}`}
                  placeholder={keyPlaceholder}
                  value={key}
                  onChange={(e) => updateRow(id, { key: e.target.value })}
                  onBlur={() => commit()}
                  disabled={disabled}
                  aria-invalid={keyInvalid ? true : undefined}
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
                    aria-invalid={valueInvalid ? true : undefined}
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
                    aria-invalid={valueInvalid ? true : undefined}
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
