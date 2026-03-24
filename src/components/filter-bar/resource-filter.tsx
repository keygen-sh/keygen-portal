import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import * as Search from "@/components/search"

import { type SearchableResource } from "@/types/search"
import { AnyResource } from "@/types/api"

import { cn } from "@/lib/utils"

import { type LucideIcon } from "lucide-react"

import { truncator } from "@/lib/truncate"

import { useFilterStateContext } from "@/contexts/filter-bar-context"
import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment } from "./filter-segment"

const truncate = truncator("clip", { maxLength: 8 })

export interface ResourceFilterProps {
  label: string
  icon?: LucideIcon
  resource: SearchableResource
  options?: AnyResource[]
  onActivate?: () => void
  clearLabel?: string
  value?: string
  onChange: (value: string | undefined) => void
}

export default function ResourceFilter({
  label,
  icon,
  resource,
  options = [],
  onActivate: onActivateProp,
  clearLabel,
  value,
  onChange,
}: ResourceFilterProps) {
  const [valueOpen, setValueOpen] = useState(false)

  const {
    filterState,
    currentValue,
    handleActivate: activate,
    handleConfirm,
    handleRemove,
    handleChange,
  } = useFilterState(value, "", onChange)

  function handleActivate() {
    onActivateProp?.()
    activate()
    setValueOpen(true)
  }

  function handleValueSelect(id: string | null) {
    if (id) handleChange(id)
    setValueOpen(false)
  }

  const displayValue = currentValue ? truncate(currentValue) : null

  return (
    <FilterSegmentGroup
      state={filterState}
      icon={icon}
      label={label}
      onActivate={handleActivate}
      onConfirm={handleConfirm}
      onRemove={handleRemove}
      confirmDisabled={!currentValue}
    >
      <FilterSegment first icon={icon}>
        {label}
      </FilterSegment>
      <FilterSegment>eq</FilterSegment>

      <ResourceValueSegment
        resource={resource}
        options={options}
        clearLabel={clearLabel}
        currentValue={currentValue || null}
        displayValue={displayValue}
        open={valueOpen}
        onOpenChange={setValueOpen}
        onSelect={handleValueSelect}
        onConfirm={() => {
          handleConfirm()
          setValueOpen(false)
        }}
      />
    </FilterSegmentGroup>
  )
}

function ResourceValueSegment({
  resource,
  options,
  clearLabel,
  currentValue,
  displayValue,
  open,
  onOpenChange,
  onSelect,
  onConfirm,
}: {
  resource: SearchableResource
  options: AnyResource[]
  clearLabel?: string
  currentValue: string | null
  displayValue: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string | null) => void
  onConfirm: () => void
}) {
  const state = useFilterStateContext()
  const isDraft = state === "draft"

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
            isDraft
              ? "bg-background-2/60 hover:brightness-125"
              : "bg-secondary/20",
            displayValue
              ? isDraft
                ? "text-content-subdued"
                : "text-secondary hover:text-secondary-light"
              : "text-content-disabled italic",
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
              onClick={onConfirm}
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
