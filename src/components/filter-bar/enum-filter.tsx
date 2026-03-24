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
  const defaultValue = options[0]?.value ?? ""

  const {
    filterState,
    currentValue,
    handleActivate,
    handleConfirm,
    handleRemove,
    handleChange,
  } = useFilterState(value, defaultValue, onChange)

  const displayLabel =
    options.find((o) => o.value === currentValue)?.label ?? currentValue

  return (
    <FilterSegmentGroup
      state={filterState}
      icon={icon}
      label={label}
      onActivate={handleActivate}
      onConfirm={handleConfirm}
      onRemove={handleRemove}
    >
      <FilterSegment first icon={icon}>
        {label}
      </FilterSegment>
      <FilterSegment>eq</FilterSegment>
      <FilterSegment
        clickable
        last
        popover={(close) => (
          <OptionList
            options={options}
            value={currentValue}
            onSelect={(v) => {
              handleChange(v)
              close()
            }}
          />
        )}
        popoverClassName="w-36"
      >
        {displayLabel}
      </FilterSegment>
    </FilterSegmentGroup>
  )
}
