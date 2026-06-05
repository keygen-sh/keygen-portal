import { useState } from "react"

import { type LucideIcon } from "lucide-react"

import { useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
  FilterOptionList,
} from "./filter-segment"

const BOOLEAN_OPTIONS = [
  { label: "Is", value: "true" },
  { label: "Is not", value: "false" },
] as const

export interface BooleanFilterProps {
  label: string
  icon?: LucideIcon
  value?: boolean
  onChange: (value: boolean | undefined) => void
}

export default function BooleanFilter({
  label,
  icon,
  value,
  onChange,
}: BooleanFilterProps) {
  const filter = useFilterState(value, true, onChange)
  const [open, setOpen] = useState(false)

  const selected = BOOLEAN_OPTIONS.find((o) =>
    filter.value ? o.value === "true" : o.value === "false",
  )!

  function handleOpChange(op: string) {
    filter.handleChange(op === "true")
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={filter.handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
    >
      <FilterPopoverSegment
        className="w-24"
        open={open}
        onOpenChange={setOpen}
        popover={(close) => (
          <FilterOptionList
            options={BOOLEAN_OPTIONS}
            value={selected.value}
            onSelect={(op) => {
              handleOpChange(op)
              close()
            }}
          />
        )}
      >
        {selected.label.toLowerCase()}
      </FilterPopoverSegment>
      <FilterSegment>{label}</FilterSegment>
    </FilterSegmentGroup>
  )
}
