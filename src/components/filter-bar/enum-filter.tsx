import { type LucideIcon } from "lucide-react"

import { useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
  FilterOptionList,
} from "./filter-segment"

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
  const filter = useFilterState(value, options[0]?.value ?? "", onChange)

  const selected = options.find((o) => o.value === filter.value) || options[0]

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={filter.handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>eq</FilterSegment>
      <FilterPopoverSegment
        className="w-36"
        popover={(close) => (
          <FilterOptionList
            options={options}
            value={filter.value}
            onSelect={(v) => {
              filter.handleChange(v)
              close()
            }}
          />
        )}
      >
        {selected.label}
      </FilterPopoverSegment>
    </FilterSegmentGroup>
  )
}
