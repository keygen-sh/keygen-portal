import { useState, useRef } from "react"
import { X, Braces, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import { FilterState, useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment } from "./filter-segment"

type MetadataRow = { id: string; key: string; value: string }

function recordToRows(record?: Record<string, string>): MetadataRow[] {
  if (!record || Object.keys(record).length === 0) return []
  return Object.entries(record).map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value,
  }))
}

function rowsToRecord(rows: MetadataRow[]): Record<string, string> | undefined {
  const result: Record<string, string> = {}
  for (const row of rows) {
    const k = row.key.trim()
    const v = row.value.trim()
    if (k && v) result[k] = v
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export interface MetadataFilterProps {
  label?: string
  icon?: LucideIcon
  value?: Record<string, string>
  onChange: (value: Record<string, string> | undefined) => void
}

export default function MetadataFilter({
  label = "Metadata",
  icon: Icon = Braces,
  value,
  onChange,
}: MetadataFilterProps) {
  const filter = useFilterState(value, {}, onChange)
  const [open, setOpen] = useState(false)

  function handleActivate() {
    filter.handleActivate()
    setOpen(true)
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={Icon}
      label={label}
      onActivate={handleActivate}
      onConfirm={filter.handleConfirm}
      onRemove={filter.handleRemove}
    >
      <FilterSegment first icon={Icon}>
        {label}
      </FilterSegment>
      <MetadataInputSegment
        state={filter.state}
        value={filter.value}
        open={open}
        onOpenChange={setOpen}
        onChange={(record) => {
          if (record) {
            filter.handleChange(record)
          } else {
            filter.handleRemove()
          }
        }}
      />
    </FilterSegmentGroup>
  )
}

function MetadataInputSegment({
  state,
  value,
  open,
  onOpenChange,
  onChange,
}: {
  state: FilterState
  value: Record<string, string>
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: Record<string, string> | undefined) => void
}) {
  const entries = Object.entries(value)
  const isActive = state === "active"
  const isDraft = state === "draft"

  // initialized from the committed value on mount, ensuring at least
  // one empty row so the user always has something to type into
  const [internalRows, setInternalRows] = useState<MetadataRow[]>(() => {
    const rows = recordToRows(value)
    if (rows.length === 0) {
      rows.push({ id: crypto.randomUUID(), key: "", value: "" })
    }

    return rows
  })

  const focusTargetRef = useRef<{
    index: number
    field: "key" | "value"
  } | null>(null)

  // focuses a row's key or value field on the next frame (we're rendering on next
  // frame because the row may not actually until next render)
  function focusField(rowId: string, field: "key" | "value") {
    requestAnimationFrame(() =>
      document.getElementById(`metadata-${field}-${rowId}`)?.focus(),
    )
  }

  function handleOpenWithAutoFocus() {
    const target = focusTargetRef.current
    if (target == null) {
      return
    }

    const rowId = internalRows[target.index]?.id
    if (rowId) {
      focusField(rowId, target.field)
    }

    focusTargetRef.current = null
  }

  // focus a specific row field directly if the popover is already open,
  // otherwise deferred via ref until onOpenAutoFocus fires
  function handleOpenWithFocus(index: number, field: "key" | "value") {
    if (open) {
      const rowId = internalRows[index]?.id
      if (rowId) {
        focusField(rowId, field)
      }
    } else {
      focusTargetRef.current = { index, field }
      onOpenChange(true)
    }
  }

  function handleRowChange(id: string, field: "key" | "value", next: string) {
    setInternalRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: next } : row)),
    )
  }

  function handleRowDelete(id: string) {
    setInternalRows((prev) => prev.filter((row) => row.id !== id))
  }

  function handleRowAdd() {
    const row = { id: crypto.randomUUID(), key: "", value: "" }
    setInternalRows((prev) => [...prev, row])
    focusField(row.id, "key")
  }

  function handleSubmit() {
    onChange(rowsToRecord(internalRows))
    onOpenChange(false)
  }

  function handleCancel() {
    // discard uncommitted edits so re-opening reflects the committed value
    setInternalRows(recordToRows(value))
    onOpenChange(false)
  }

  const canAdd = internalRows.every(
    ({ key, value }) => key.trim() && value.trim(),
  )
  const canSubmit = internalRows.some(
    ({ key, value }) => key.trim() && value.trim(),
  )

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true)
        } else {
          handleCancel()
        }
      }}
    >
      <PopoverTrigger asChild>
        {isActive ? (
          <span className="inline-flex h-full cursor-pointer items-center bg-secondary/20 text-xs outline-none">
            <span className="px-0 text-secondary/40">{"{"}</span>
            {entries.map(([k, v], i) => (
              <span key={k} className="inline-flex items-center">
                {i > 0 && (
                  <span className="px-0 text-secondary/40">,&nbsp;</span>
                )}
                <span
                  className="text-secondary transition-colors hover:text-secondary-light"
                  onClick={(e) => {
                    e.preventDefault()

                    handleOpenWithFocus(i, "key")
                  }}
                >
                  {k}
                </span>
                <span className="px-0 text-secondary/40">:&nbsp;</span>
                <span
                  className="text-secondary transition-colors hover:text-secondary-light"
                  onClick={(e) => {
                    e.preventDefault()

                    handleOpenWithFocus(i, "value")
                  }}
                >
                  {v}
                </span>
              </span>
            ))}
            <span className="px-0 text-secondary/40">{"}"}</span>
          </span>
        ) : (
          <button
            type="button"
            className={cn(
              "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
              isDraft
                ? "bg-background-2/60 text-content-disabled italic hover:brightness-125"
                : "bg-secondary/20 text-secondary hover:text-secondary-light",
            )}
          >
            ...
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 !bg-background p-0"
        onOpenAutoFocus={(e) => {
          // only focus a field when a specific key/value is clicked
          // or let the browser autofocus when in draft
          if (focusTargetRef.current || isActive) {
            e.preventDefault()
          }

          handleOpenWithAutoFocus()
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div>
          <div className="space-y-2 p-3">
            {internalRows.map(({ id, key: k, value: v }) => (
              <div key={id} className="flex items-center gap-2">
                <Input
                  id={`metadata-key-${id}`}
                  fieldSize="sm"
                  placeholder="Key"
                  value={k}
                  onChange={(e) => handleRowChange(id, "key", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit()
                  }}
                />
                <Input
                  id={`metadata-value-${id}`}
                  fieldSize="sm"
                  placeholder="Value"
                  value={v}
                  onChange={(e) => handleRowChange(id, "value", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit()
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRowDelete(id)}
                  className="shrink-0 cursor-pointer text-content-subdued transition-colors outline-none hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleRowAdd}
              disabled={!canAdd}
              className={cn(
                "text-xs transition-colors",
                canAdd
                  ? "cursor-pointer text-content-muted hover:text-content-loud"
                  : "cursor-not-allowed text-content-disabled",
              )}
            >
              + Add Key/Value Pair
            </button>
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
