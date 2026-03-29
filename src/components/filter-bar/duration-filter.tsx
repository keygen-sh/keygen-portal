import { type LucideIcon } from "lucide-react"

import { FilterState, useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"
import { isoToHumanDuration } from "@/lib/temporal"

export type DurationOption = {
  label: string
  op: "within" | "in" | "inside" | "outside"
  options: ReadonlyArray<{
    label: string
    value: string
  }>
}

export interface DurationFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<DurationOption>
  value?: Record<string, string>
  onChange: (value: Record<string, string> | undefined) => void
}

export default function DurationFilter({
  label,
  icon,
  options,
  value,
  onChange,
}: DurationFilterProps) {
  const filter = useFilterState(value, {}, onChange)

  // we only allow one operation at a time so we'll just grab the first pair
  const [currentOp] = Object.keys(filter.value)
  const currentValue = filter.value[currentOp]

  const ops = options.map((o) => ({ label: o.label, value: o.op }))
  const selected = options.find((o) => o.op === currentOp) ?? options[0]

  const displayValue = isoToHumanDuration(currentValue)

  function handleOpChange(op: string) {
    filter.handleChange({ [op]: currentValue })
  }

  function handleDurationChange(duration: string) {
    filter.handleChange({ [selected.op]: duration })
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
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment
        clickable
        popover={(close) => (
          <OptionList
            options={ops}
            value={currentOp}
            onSelect={(op) => {
              handleOpChange(op)
              close()
            }}
          />
        )}
        popoverClassName="w-28"
      >
        {selected.label.toLowerCase()}
      </FilterSegment>
      <DurationPickerSegment
        state={filter.state}
        options={selected.options}
        value={currentValue}
        displayValue={displayValue}
        onSelect={handleDurationChange}
      />
    </FilterSegmentGroup>
  )
}

export function DurationPickerSegment({
  value,
  options,
  displayValue,
  onSelect,
}: {
  state: FilterState
  value: string
  options: DurationOption["options"]
  displayValue: string
  onSelect: (duration: string) => void
}) {
  return (
    <FilterSegment
      clickable
      popover={(close) => (
        <OptionList
          options={options}
          value={value}
          onSelect={(v) => {
            onSelect(v)
            close()
          }}
        />
      )}
      popoverClassName="w-28"
    >
      {displayValue || (
        <span className="bg-background-2/60 text-content-disabled italic hover:brightness-125">
          select...
        </span>
      )}
    </FilterSegment>
  )
}
