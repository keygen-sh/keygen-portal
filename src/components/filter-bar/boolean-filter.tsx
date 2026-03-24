import { type LucideIcon } from "lucide-react"

import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"

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
  const {
    filterState,
    currentValue,
    handleActivate,
    handleConfirm,
    handleRemove,
    handleChange,
  } = useFilterState(value, true, onChange)

  const operatorOptions = [
    { value: "is", label: "is" },
    { value: "is-not", label: "is not" },
  ] as const

  const operatorValue = currentValue === true ? "is" : "is-not"

  function handleOperatorSelect(op: string) {
    handleChange(op === "is")
  }

  return (
    <FilterSegmentGroup
      state={filterState}
      icon={icon}
      label={label}
      onActivate={handleActivate}
      onConfirm={handleConfirm}
      onRemove={handleRemove}
    >
      <FilterSegment first icon={icon} />
      <FilterSegment
        clickable
        popover={(close) => (
          <OptionList
            options={operatorOptions}
            value={operatorValue}
            onSelect={(v) => {
              handleOperatorSelect(v)
              close()
            }}
          />
        )}
        popoverClassName="w-24"
      >
        {operatorValue === "is" ? "is" : "is not"}
      </FilterSegment>
      <FilterSegment last>{label}</FilterSegment>
    </FilterSegmentGroup>
  )
}
