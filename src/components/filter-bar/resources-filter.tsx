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

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment } from "./filter-segment"

export interface ResourcesFilterProps {
  label: string
  icon?: LucideIcon
  resource: SearchableResource
  options?: AnyResource[]
  onDraft?: () => void
  value?: string[]
  onChange: (value: string[] | undefined) => void
}

export default function ResourcesFilter({
  label,
  icon,
  resource,
  options = [],
  onDraft,
  value,
  onChange,
}: ResourcesFilterProps) {
  const filter = useFilterState(value, [] as string[], onChange)
  const [open, setOpen] = useState(false)

  const count = filter.value.length
  const displayValue = count > 0 ? `${count} selected` : null

  function handleDraft() {
    filter.handleDraft()
    onDraft?.()
    setOpen(true)
  }

  function handleValueChange(ids: string[]) {
    filter.handleDraftChange(ids)
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
      confirmDisabled={filter.value.length === 0}
      onDraft={handleDraft}
      onActivate={handleActivate}
      onDeactivate={filter.handleDeactivate}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>in</FilterSegment>
      <ResourcesMultiSelectSegment
        state={filter.state}
        resource={resource}
        options={options}
        currentValue={filter.value}
        displayValue={displayValue}
        open={open}
        onOpenChange={setOpen}
        onSelect={handleValueChange}
        onActivate={handleActivate}
      />
    </FilterSegmentGroup>
  )
}

function ResourcesMultiSelectSegment({
  state,
  resource,
  options,
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
  currentValue: string[]
  displayValue: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (ids: string[]) => void
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
            <Search.MultiSelect
              resource={resource}
              value={currentValue}
              onChange={onSelect}
              options={options}
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
              disabled={isDraft && currentValue.length === 0}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
