import { useState } from "react"

import { type LucideIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"

import { useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
} from "./filter-segment"

import { cn } from "@/lib/utils"

const MAX_VISIBLE_OPTIONS = 8

export interface ArrayFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string[]
  onChange: (value: string[] | undefined) => void
}

export default function ArrayFilter({
  label,
  icon,
  options,
  value,
  onChange,
}: ArrayFilterProps) {
  const filter = useFilterState(value, [] as string[], onChange)
  const [open, setOpen] = useState(false)

  const selected = options.filter((o) => filter.value.includes(o.value))
  const displayValue =
    selected.length > 0 ? selected.map((o) => o.label).join(", ") : "select..."

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={filter.handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
      confirmDisabled={filter.value.length === 0}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>in</FilterSegment>
      <FilterPopoverSegment
        className="w-max min-w-44 max-w-96"
        open={open}
        onOpenChange={setOpen}
        popover={(close) => (
          <ScrollArea
            className={cn(options.length > MAX_VISIBLE_OPTIONS && "h-64")}
          >
            <div className="flex flex-col gap-0.5">
              {options.map((opt) => {
                const isSelected = filter.value.includes(opt.value)

                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      "w-full cursor-pointer rounded-sm px-2 py-1 text-left text-xs whitespace-nowrap transition-colors hover:bg-accent",
                      isSelected && "bg-accent",
                    )}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        const next = isSelected
                          ? filter.value.filter((v) => v !== opt.value)
                          : [...filter.value, opt.value]

                        filter.handleDraftChange(next)
                      } else {
                        filter.handleChange([opt.value])
                        close()
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}
      >
        {displayValue}
      </FilterPopoverSegment>
    </FilterSegmentGroup>
  )
}
