import { useRef, useState } from "react"
import { type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment } from "./filter-segment"

export type PolymorphicResourceValue = { type: string; id: string }

export interface PolymorphicResourceFilterProps {
  label: string
  icon?: LucideIcon
  placeholder?: string
  types: ReadonlyArray<{ value: string; label: string }>
  value?: PolymorphicResourceValue
  onChange: (value: PolymorphicResourceValue | undefined) => void
}

export default function PolymorphicResourceFilter({
  label,
  icon,
  placeholder,
  types,
  value,
  onChange,
}: PolymorphicResourceFilterProps) {
  const filter = useFilterState<PolymorphicResourceValue>(
    value,
    { type: types[0]?.value ?? "", id: "" },
    onChange,
  )
  const [open, setOpen] = useState(false)

  function handleDraft() {
    filter.handleDraft()
    setOpen(true)
  }

  const current = filter.value
  const typeLabel =
    types.find((t) => t.value === current.type)?.label ?? current.type
  const displayValue = current.id ? `${typeLabel}: ${current.id}` : "select..."

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
      confirmDisabled={!current.id}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>eq</FilterSegment>
      <PolymorphicResourceSegment
        state={filter.state}
        types={types}
        value={current}
        placeholder={placeholder}
        displayValue={displayValue}
        open={open}
        onOpenChange={setOpen}
        onApply={(next) => {
          if (next.id) {
            filter.handleChange(next)
          } else {
            filter.handleDeactivate()
          }
        }}
      />
    </FilterSegmentGroup>
  )
}

function PolymorphicResourceSegment({
  state,
  types,
  value,
  placeholder,
  displayValue,
  open,
  onOpenChange,
  onApply,
}: {
  state: FilterState
  types: ReadonlyArray<{ value: string; label: string }>
  value: PolymorphicResourceValue
  placeholder?: string
  displayValue: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (value: PolymorphicResourceValue) => void
}) {
  const isDraft = state === "draft"

  const [type, setType] = useState(value.type || types[0]?.value || "")
  const [id, setId] = useState(value.id)
  const inputRef = useRef<HTMLInputElement>(null)

  const canApply = !!type && id.trim().length > 0

  function reset() {
    setType(value.type || types[0]?.value || "")
    setId(value.id)
  }

  function handleApply() {
    if (!canApply) return
    onApply({ type, id: id.trim() })
    onOpenChange(false)
  }

  function handleCancel() {
    reset()
    onOpenChange(false)
  }

  function handleOpen() {
    reset()
    onOpenChange(true)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          handleOpen()
        } else {
          handleCancel()
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
            isDraft
              ? "bg-background-2/60 text-content-disabled italic hover:brightness-125"
              : "bg-secondary/20 text-secondary hover:text-secondary-light",
          )}
        >
          {displayValue}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 !bg-background p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2 p-2">
          <div className="flex flex-wrap gap-1">
            {types.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  "cursor-pointer rounded-sm px-2 py-0.5 text-xs transition-colors hover:bg-accent",
                  type === t.value && "bg-accent text-accent-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Input
            ref={inputRef}
            fieldSize="sm"
            placeholder={placeholder ?? "ID"}
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canApply) handleApply()
            }}
          />
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
            onClick={handleApply}
            disabled={!canApply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
