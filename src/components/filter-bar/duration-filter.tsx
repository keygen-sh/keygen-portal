import { useMemo } from "react"
import { type LucideIcon } from "lucide-react"

import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"
import { isoToHumanDuration } from "@/lib/temporal"

export interface DurationFilterProps {
  label: string
  icon?: LucideIcon
  ops: ReadonlyArray<{ value: string; label: string }>
  durations: ReadonlyArray<{ label: string; iso: string }>
  value?: Record<string, string>
  onChange: (value: Record<string, string> | undefined) => void
}

export default function DurationFilter({
  label,
  icon,
  ops,
  durations,
  value,
  onChange,
}: DurationFilterProps) {
  const defaultValue = useMemo(
    () => ({ [ops[0].value]: durations[0].iso }),
    [ops, durations],
  )

  const {
    filterState,
    currentValue,
    handleActivate,
    handleConfirm,
    handleRemove,
    handleChange,
  } = useFilterState(value, defaultValue, onChange)

  const currentOp = Object.keys(currentValue)[0]
  const currentVal = Object.values(currentValue)[0]
  const opLabel =
    ops.find((o) => o.value === currentOp)?.label?.toLowerCase() ?? currentOp
  const displayValue = isoToHumanDuration(currentVal)

  function handleOpSelect(op: string) {
    handleChange({ [op]: currentVal })
  }

  function handleDurationSelect(iso: string) {
    handleChange({ [currentOp]: iso })
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
      <FilterSegment first icon={icon}>
        {label}
      </FilterSegment>
      <FilterSegment
        clickable
        popover={(close) => (
          <OptionList
            options={ops}
            value={currentOp}
            onSelect={(v) => {
              handleOpSelect(v)
              close()
            }}
          />
        )}
        popoverClassName="w-28"
      >
        {opLabel}
      </FilterSegment>
      <FilterSegment
        clickable
        popover={(close) => (
          <OptionList
            options={durations.map((p) => ({
              value: p.iso,
              label: p.label,
            }))}
            value={currentVal}
            onSelect={(v) => {
              handleDurationSelect(v)
              close()
            }}
          />
        )}
        popoverClassName="w-28"
      >
        {displayValue || "select..."}
      </FilterSegment>
    </FilterSegmentGroup>
  )
}
