import { useState, useEffect, useRef, useMemo } from "react"
import { useController, FieldPath, FieldValues } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { X } from "lucide-react"

type Pair = { id: string; key: string; value: string }

interface KeyValueInputProps<TFormValues extends FieldValues> {
  name: FieldPath<TFormValues>
  addLabel?: string
  keyPlaceholder?: string
  valuePlaceholder?: string
  disabled?: boolean
}

export default function KeyValueInput<
  TFormValues extends Record<string, unknown>,
>({
  name,
  addLabel = "New Key/Value Pair",
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  disabled,
}: KeyValueInputProps<TFormValues>): React.ReactElement {
  const { field } = useController<TFormValues, FieldPath<TFormValues>>({ name })

  const [rows, setRows] = useState<Pair[]>(() =>
    Object.entries(
      (field.value as Record<string, string> | undefined) ?? {},
    ).map(([key, value], i) => ({ id: `${i}-${key}`, key, value })),
  )

  const lastValueRef = useRef<string | null>(null)
  const value = useMemo(() => JSON.stringify(field.value ?? {}), [field.value])

  useEffect(() => {
    if (value !== lastValueRef.current) {
      const entries = (field.value as Record<string, string> | undefined) ?? {}

      setRows(
        Object.entries(entries).map(([key, value], i) => ({
          id: `${i}-${key}`,
          key,
          value,
        })),
      )
    }
  }, [value, field.value])

  const commit = (draft: Pair[] = rows) => {
    const entries = Object.fromEntries(
      draft
        .map(({ key, value }) => [key.trim(), value.trim()] as const)
        .filter(([key, value]) => key.length && value.length),
    )

    const next = JSON.stringify(entries)

    if (next !== value) {
      lastValueRef.current = next
      field.onChange(entries)
    }
  }

  const addRow = () => {
    const id = crypto.randomUUID()

    setRows((prev) => [...prev, { id, key: "", value: "" }])

    requestAnimationFrame(() =>
      document.getElementById(`key-value-key-${id}`)?.focus(),
    )
  }

  const updateRow = (id: string, field: "key" | "value", value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
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

  const canAdd = rows.every(({ key, value }) => key.trim() && value.trim())

  return (
    <div className="space-y-2">
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
          {rows.map(({ id, key, value }) => (
            <div key={id} className="flex items-center gap-2">
              <Input
                id={`key-value-key-${id}`}
                placeholder={keyPlaceholder}
                value={key}
                onChange={(e) => updateRow(id, "key", e.target.value)}
                onBlur={() => commit()}
                disabled={disabled}
              />
              <Input
                placeholder={valuePlaceholder}
                value={value}
                onChange={(e) => updateRow(id, "value", e.target.value)}
                onBlur={() => commit()}
                disabled={disabled}
              />
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
          ))}

          <Button
            id="key-value-add"
            size="sm"
            type="button"
            variant="ghost"
            onClick={addRow}
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
