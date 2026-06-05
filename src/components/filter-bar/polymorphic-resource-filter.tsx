import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { truncator } from "@/lib/truncate"

import { type SearchableResource } from "@/types/search"

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"

import {
  FilterSegment,
  FilterSegmentGroup,
} from "./filter-segment"
import { EnumFilterSegment } from "./enum-filter"
import { ResourceSelectSegment } from "./resource-filter"

const truncate = truncator("clip", { maxLength: 8 })

const segmentTriggerClassName = (isDraft: boolean) =>
  cn(
    "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
    isDraft
      ? "bg-background-2/60 text-content-disabled italic hover:brightness-125"
      : "bg-secondary/20 text-secondary hover:text-secondary-light",
  )

export type PolymorphicResourceType = {
  value: string
  label: string
  resource?: SearchableResource
}

export type PolymorphicResourceValue = { type: string; id: string }

export interface PolymorphicResourceFilterProps {
  label: string
  icon?: LucideIcon
  placeholder?: string
  types: ReadonlyArray<PolymorphicResourceType>
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
    { type: "", id: "" },
    onChange,
  )
  const [typeOpen, setTypeOpen] = useState(false)
  const [resourceOpen, setResourceOpen] = useState(false)

  if (types.length === 0) return null

  const current = filter.value
  const selectedType = types.find((t) => t.value === current.type)
  const selectedLabel = selectedType?.label ?? "type"
  const displayValue = current.id ? truncate(current.id) : null

  function handleDraft() {
    filter.handleDraft()
    setResourceOpen(false)
    setTypeOpen(true)
  }

  function handleTypeChange(type: string) {
    filter.handleDraftChange({ type, id: "" })
    setTypeOpen(false)
    setResourceOpen(true)
  }

  function handleIdChange(id: string | null) {
    if (id && current.type) {
      filter.handleChange({ type: current.type, id })
    }

    setResourceOpen(false)
  }

  function handleActivate() {
    filter.handleActivate()
    setTypeOpen(false)
    setResourceOpen(false)
  }

  function handleDeactivate() {
    filter.handleDeactivate()
    setTypeOpen(false)
    setResourceOpen(false)
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={handleDraft}
      onActivate={handleActivate}
      onDeactivate={handleDeactivate}
      confirmDisabled={!current.type || !current.id}
    >
      <FilterSegment>{label}</FilterSegment>
      <EnumFilterSegment
        options={types}
        value={current.type}
        open={typeOpen}
        onOpenChange={setTypeOpen}
        onSelect={handleTypeChange}
      >
        {selectedLabel}
      </EnumFilterSegment>

      {current.type ? (
        <>
          <FilterSegment>eq</FilterSegment>
          {selectedType?.resource ? (
            <ResourceSelectSegment
              key={selectedType.value}
              state={filter.state}
              resource={selectedType.resource}
              options={[]}
              currentValue={current.id || null}
              displayValue={displayValue}
              open={resourceOpen}
              onOpenChange={setResourceOpen}
              onSelect={handleIdChange}
              onActivate={handleActivate}
            />
          ) : (
            <IdInputSegment
              key={selectedType?.value ?? "id"}
              state={filter.state}
              value={current.id}
              placeholder={placeholder}
              open={resourceOpen}
              onOpenChange={setResourceOpen}
              onApply={handleIdChange}
            />
          )}
        </>
      ) : null}
    </FilterSegmentGroup>
  )
}

function IdInputSegment({
  state,
  value,
  placeholder,
  open,
  onOpenChange,
  onApply,
}: {
  state: FilterState
  value: string
  placeholder?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (id: string | null) => void
}) {
  const isDraft = state === "draft"

  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setDraft(value)
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open, value])

  function handleApply() {
    const trimmed = draft.trim()
    onApply(trimmed || null)
  }

  function handleCancel() {
    setDraft(value)
    onOpenChange(false)
  }

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
        <button type="button" className={segmentTriggerClassName(isDraft)}>
          {value ? truncate(value) : "select..."}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 !bg-background p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2">
          <Input
            ref={inputRef}
            fieldSize="sm"
            placeholder={placeholder ?? "ID"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) handleApply()
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
            disabled={!draft.trim()}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
