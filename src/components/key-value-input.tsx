import { useEffect, useRef, useState } from "react"
import {
  useWatch,
  useFormContext,
  FieldPath,
  FieldValues,
  PathValue,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const { register, getValues, setValue } = useFormContext<TFormValues>()

  const saved = useWatch({ name }) as Record<string, string> | undefined

  const buildRows = (object?: Record<string, string>) =>
    Object.entries(object ?? {}).map(([key, value], i) => ({
      id: String(i) + "-" + key,
      key,
      value,
    }))

  const initialized = useRef(false)
  const [rows, setRows] = useState<Pair[]>(() => buildRows(saved))

  useEffect(() => {
    if (!initialized.current) {
      setRows(buildRows(saved))
      initialized.current = true
    }
  }, [saved])

  useEffect(() => {
    register(name as any)
    const v = getValues(name as any)
    if (v == null || typeof v !== "object" || Array.isArray(v)) {
      setValue(name, {} as PathValue<TFormValues, typeof name>, {
        shouldValidate: true,
        shouldDirty: false,
      })
    }
  }, [name, register, getValues, setValue])

  const nextId = useRef<string | null>(null)

  const commit = (draft: Pair[]) => {
    const entries = draft
      .map(({ key, value }) => [key.trim(), value.trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0)

    const record = Object.fromEntries(entries)
    setValue(name, record as unknown as PathValue<TFormValues, typeof name>, {
      shouldValidate: true,
    })
  }

  const addRow = () => {
    nextId.current = crypto.randomUUID()
    setRows((row) => [...row, { id: nextId.current!, key: "", value: "" }])
    requestAnimationFrame(() =>
      document.getElementById(`key-value-key-${nextId.current}`)?.focus(),
    )
  }

  const updateRow = (id: string, field: "key" | "value", value: string) => {
    setRows((prev) => {
      const next = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      )
      commit(next)
      return next
    })
  }

  const deleteRow = (id: string, usingKeys: boolean) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id)
      commit(next)
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
                disabled={disabled}
              />
              <Input
                placeholder={valuePlaceholder}
                value={value}
                onChange={(e) => updateRow(id, "value", e.target.value)}
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
            disabled={!canAdd}
            className="text-content-muted"
          >
            + {addLabel}
          </Button>
        </>
      )}
    </div>
  )
}
