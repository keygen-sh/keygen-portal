import { type LucideIcon } from "lucide-react"

import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"

const BOOLEAN_OPTIONS = [
  { label: "Is", value: "eq" },
  { label: "Is not", value: "ne" },
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

  const selected = BOOLEAN_OPTIONS.find((o) =>
    filter.value ? o.value === "eq" : o.value === "ne",
  )!

  function handleOpChange(op: string) {
    filter.handleChange(op === "eq")
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onActivate={filter.handleActivate}
      onConfirm={filter.handleConfirm}
      onRemove={filter.handleRemove}
    >
      <FilterSegment first icon={icon} />
      <FilterSegment
        clickable
        popover={(close) => (
          <OptionList
            options={BOOLEAN_OPTIONS}
            value={selected.value}
            onSelect={(op) => {
              handleOpChange(op)
              close()
            }}
          />
        )}
        popoverClassName="w-24"
      >
        {selected.label.toLowerCase()}
      </FilterSegment>
      <FilterSegment last>{label}</FilterSegment>
    </FilterSegmentGroup>
  )
}
