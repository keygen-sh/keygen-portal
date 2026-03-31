import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import * as Search from "@/components/search"

import { type SearchableResource } from "@/types/search"
import { type AnyResource } from "@/types/api"

import { cn } from "@/lib/utils"

import { type LucideIcon } from "lucide-react"

import { truncator } from "@/lib/truncate"

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment } from "./filter-segment"

const truncate = truncator("clip", { maxLength: 8 })

export interface ResourceFilterProps {
  label: string
  icon?: LucideIcon
  resource: SearchableResource
  options?: AnyResource[]
  onDraft?: () => void
  clearLabel?: string
  value?: string
  onChange: (value: string | undefined) => void
}

export default function ResourceFilter({
  label,
  icon,
  resource,
  options = [],
  onDraft,
  clearLabel,
  value,
  onChange,
}: ResourceFilterProps) {
  const filter = useFilterState(value, "", onChange)
  const [open, setOpen] = useState(false)

  const displayValue = filter.value ? truncate(filter.value) : null

  // our onDraft callback triggers a query to populate the resource select
  function handleDraft() {
    filter.handleDraft()
    onDraft?.()
    setOpen(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

  function handleValueChange(id: string | null) {
    if (id) {
      filter.handleChange(id)
    }
    setOpen(false)
  }

  function handleActivate() {
    filter.handleActivate()
    setOpen(false)
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      confirmDisabled={!filter.value}
      onDraft={handleDraft}
      onActivate={handleActivate}
      onDeactivate={filter.handleDeactivate}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>eq</FilterSegment>
      <ResourceSelectSegment
        state={filter.state}
        resource={resource}
        options={options}
        clearLabel={clearLabel}
        currentValue={filter.value || null}
        displayValue={displayValue}
        open={open}
        onOpenChange={handleOpenChange}
        onSelect={handleValueChange}
        onActivate={handleActivate}
      />
    </FilterSegmentGroup>
  )
}

export function ResourceSelectSegment({
  state,
  resource,
  options,
  clearLabel,
  currentValue,
  displayValue,
  open,
  onOpenChange,
  onSelect,
  onActivate,
}: {
  state: FilterState
  resource: SearchableResource
  options: AnyResource[]
  clearLabel?: string
  currentValue: string | null
  displayValue: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string | null) => void
  onActivate: () => void
}) {
  const isDraft = state === "draft"

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
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
          {displayValue || "select..."}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 !bg-background p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div>
          <div className="p-2">
            <Search.Select
              resource={resource}
              value={currentValue}
              onChange={onSelect}
              options={options}
              allowClear={false}
              clearLabel={clearLabel}
              autoFocus
              className="!bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={onActivate}
              disabled={isDraft && !currentValue}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
