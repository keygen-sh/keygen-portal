import { useState, useRef } from "react"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

import { AttributesFormValues } from "@/components/products/create/attributes-form"

type Pair = { id: string; key: string; value: string }

interface MetaInputProps {
  disabled?: boolean
}

export default function MetaInput({
  disabled,
}: MetaInputProps): React.ReactElement {
  const { watch, setValue } = useFormContext<AttributesFormValues>()
  const saved = watch("metadata") ?? {}

  const [rows, setRows] = useState<Pair[]>(
    Object.entries(saved).map(([key, value], index) => ({
      id: String(index),
      key,
      value,
    })),
  )

  const nextId = useRef<string>(null)

  const commit = (draft: Pair[]) => {
    const record: Record<string, string> = {}
    draft.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) record[key.trim()] = value.trim()
    })
    setValue("metadata", record, { shouldValidate: true })
  }

  const addRow = () => {
    nextId.current = crypto.randomUUID()
    setRows([...rows, { id: nextId.current, key: "", value: "" }])

    requestAnimationFrame(() =>
      document.getElementById(`meta-key-${nextId.current}`)?.focus(),
    )
  }

  const updateRow = (id: string, key: "key" | "value", value: string) => {
    const next = rows.map((row) =>
      row.id === id ? { ...row, [key]: value } : row,
    )
    setRows(next)
    commit(next)
  }

  const deleteRow = (id: string, usingKeys: boolean) => {
    const next = rows.filter((row) => row.id !== id)
    setRows(next)
    commit(next)

    if (!usingKeys) return // If user clicked, i.e. not using keys to navigate form, don't focus 'add' button

    requestAnimationFrame(() => document.getElementById("meta-add")?.focus())
  }

  const canAdd = rows.every(({ key, value }) => key.trim() && value.trim())

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <Button
          id="meta-add"
          size="sm"
          type="button"
          variant="ghost"
          onClick={addRow}
          disabled={disabled}
          className="text-content-muted"
        >
          + New Key/Value Pair
        </Button>
      ) : (
        <>
          {rows.map(({ id, key, value }) => (
            <div key={id} className="flex items-center gap-2">
              <Input
                id={`meta-key-${id}`}
                placeholder="Key"
                value={key}
                onChange={(e) => updateRow(id, "key", e.target.value)}
                disabled={disabled}
              />
              <Input
                placeholder="Value"
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
            id="meta-add"
            size="sm"
            type="button"
            variant="ghost"
            onClick={addRow}
            disabled={!canAdd}
            className="text-content-muted"
          >
            + New Key/Value Pair
          </Button>
        </>
      )}
    </div>
  )
}
