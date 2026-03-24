import { useState, useRef, useContext } from "react"
import { X, Braces, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import { FilterBarContext } from "@/contexts/filter-bar-context"
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
  const { remeasure } = useContext(FilterBarContext)
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<MetadataRow[]>(() => recordToRows(value))
  const [isEditing, setIsEditing] = useState(false)
  // snapshot of value at time of first editing started (i.e. editing auto-invalidates when
  // value changes externally, e.g. "clear all", no manual reset needed)
  const [editingValue, setEditingValue] = useState<
    Record<string, string> | undefined
  >(undefined)
  const focusTargetRef = useRef<{
    index: number
    field: "key" | "value"
  } | null>(null)

  const isActive = value != null && Object.keys(value).length > 0
  const inEditing = isEditing && value === editingValue
  const filterState = isActive ? "active" : inEditing ? "draft" : "inactive"

  function syncAndOpen() {
    if (!inEditing) setRows(recordToRows(value))
    setOpen(true)
  }

  function handleActivate() {
    const initial = recordToRows(value)
    if (initial.length === 0) {
      initial.push({ id: crypto.randomUUID(), key: "", value: "" })
    }
    setRows(initial)
    setIsEditing(true)
    setEditingValue(value)
    focusTargetRef.current = { index: 0, field: "key" }
    remeasure()
    setOpen(true)
  }

  function openWithFocus(index: number, field: "key" | "value") {
    focusTargetRef.current = { index, field }
    syncAndOpen()
  }

  function handleRemove() {
    onChange(undefined)
    setRows([])
    setIsEditing(false)
    remeasure()
  }

  function handleApply() {
    const record = rowsToRecord(rows)
    onChange(record)
    setOpen(false)
    if (!record) setIsEditing(false)
    remeasure()
  }

  function updateRow(id: string, field: "key" | "value", next: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: next } : row)),
    )
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  function addRow() {
    const id = crypto.randomUUID()
    setRows((prev) => [...prev, { id, key: "", value: "" }])
    requestAnimationFrame(() =>
      document.getElementById(`metadata-key-${id}`)?.focus(),
    )
  }

  const canAdd = rows.every(({ key, value }) => key.trim() && value.trim())
  const canApply = rows.some(({ key, value }) => key.trim() && value.trim())

  const entries = isActive ? Object.entries(value) : []

  return (
    <FilterSegmentGroup
      state={filterState}
      icon={Icon}
      label={label}
      onActivate={handleActivate}
      onConfirm={handleApply}
      onRemove={handleRemove}
      confirmDisabled={!canApply}
    >
      <FilterSegment first icon={Icon}>
        {label}
      </FilterSegment>

      <Popover
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            handleApply()
          } else {
            syncAndOpen()
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
                      openWithFocus(i, "key")
                    }}
                  >
                    {k}
                  </span>
                  <span className="px-0 text-secondary/40">:&nbsp;</span>
                  <span
                    className="text-secondary transition-colors hover:text-secondary-light"
                    onClick={(e) => {
                      e.preventDefault()
                      openWithFocus(i, "value")
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
              className="inline-flex h-full cursor-pointer items-center bg-background-2/60 px-1 text-xs text-content-disabled italic transition-colors outline-none hover:brightness-125"
            >
              ...
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-80 !bg-background p-0"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            const target = focusTargetRef.current
            if (target) {
              const rowId = rows[target.index]?.id
              if (rowId) {
                const elementId = `metadata-${target.field}-${rowId}`
                requestAnimationFrame(() =>
                  document.getElementById(elementId)?.focus(),
                )
              }
              focusTargetRef.current = null
            }
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div>
            <div className="space-y-2 p-3">
              {rows.map(({ id, key, value: val }) => (
                <div key={id} className="flex items-center gap-2">
                  <Input
                    id={`metadata-key-${id}`}
                    placeholder="Key"
                    value={key}
                    onChange={(e) => updateRow(id, "key", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApply()
                    }}
                    fieldSize="sm"
                  />
                  <Input
                    id={`metadata-value-${id}`}
                    placeholder="Value"
                    value={val}
                    onChange={(e) => updateRow(id, "value", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApply()
                    }}
                    fieldSize="sm"
                  />
                  <button
                    type="button"
                    onClick={() => deleteRow(id)}
                    className="shrink-0 cursor-pointer text-content-subdued transition-colors outline-none hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRow}
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 rounded-sm text-sm"
                onClick={handleApply}
                disabled={!canApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </FilterSegmentGroup>
  )
}
