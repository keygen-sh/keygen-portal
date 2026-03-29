import { type LucideIcon } from "lucide-react"

import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"

export interface EnumFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string
  onChange: (value: string | undefined) => void
}

export default function EnumFilter({
  label,
  icon,
  options,
  value,
  onChange,
}: EnumFilterProps) {
  const filter = useFilterState(value, "", onChange)

  const selected = options.find((o) => o.value === filter.value) || options[0]

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onActivate={filter.handleActivate}
      onConfirm={filter.handleConfirm}
      onRemove={filter.handleRemove}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>eq</FilterSegment>
      <FilterSegment
        clickable
        popover={(close) => (
          <OptionList
            options={options}
            value={filter.value}
            onSelect={(v) => {
              filter.handleChange(v)
              close()
            }}
          />
        )}
        popoverClassName="w-36"
      >
        {selected.label}
      </FilterSegment>
    </FilterSegmentGroup>
  )
}
