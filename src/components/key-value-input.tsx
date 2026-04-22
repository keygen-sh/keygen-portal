import { useMemo } from "react"
import { useController, FieldPath, FieldValues } from "react-hook-form"

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

import { CircleAlert, X } from "lucide-react"

import {
  META_TYPES,
  MetadataPairSchema,
  type MetaType,
  type MetadataPair,
} from "@/schemas/metadata"

import { cn } from "@/lib/utils"

const TYPE_OPTIONS: { value: MetaType; label: string }[] = META_TYPES.map(
  (t) => ({
    value: t,
    label: t === "json" ? "JSON" : t.charAt(0).toUpperCase() + t.slice(1),
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
  const { field, fieldState } = useController<
    TFormValues,
    FieldPath<TFormValues>
  >({ name })

  // The form field's value is the MetadataPair[] itself — the schema owns
  // the MetadataPair[] → Record transform at parse time, so submit values
  // come out as `Record<string, MetadataValue>` for the API.
  const rows = useMemo(
    () => (field.value as MetadataPair[] | undefined) ?? [],
    [field.value],
  )

  const setRows = (next: MetadataPair[]) => field.onChange(next)

  const hasErrors = useMemo(
    () => rows.some((row) => !MetadataPairSchema.safeParse(row).success),
    [rows],
  )

  const addRow = () => {
    const id = crypto.randomUUID()

    setRows([...rows, { id, key: "", type: "string", value: "" }])

    requestAnimationFrame(() =>
      document.getElementById(`key-value-key-${id}`)?.focus(),
    )
  }

  const updateRow = (
    id: string,
    changes: Partial<Pick<MetadataPair, "key" | "type" | "value">>,
  ) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)))
  }

  const changeType = (id: string, type: MetaType) => {
    setRows(
      rows.map((row) => {
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
      }),
    )
  }

  const deleteRow = (id: string, usingKeys: boolean) => {
    setRows(rows.filter((row) => row.id !== id))

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
            const result = MetadataPairSchema.safeParse({
              id,
              key,
              type,
              value,
            })
            const keyInvalid =
              !result.success &&
              result.error.issues.some((i) => i.path[0] === "key")
            const valueInvalid =
              !result.success &&
              result.error.issues.some((i) => i.path[0] === "value")

            return (
              <div key={id} className="flex items-start gap-2">
                <Input
                  id={`key-value-key-${id}`}
                  placeholder={keyPlaceholder}
                  value={key}
                  onChange={(e) => updateRow(id, { key: e.target.value })}
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
                    onValueChange={(next) => updateRow(id, { value: next })}
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

          <div className="flex items-center gap-2">
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
            {fieldState.error?.message ? (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <CircleAlert className="mt-0.25 h-4 w-4 shrink-0" />
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
