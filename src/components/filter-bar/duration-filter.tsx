import { useState } from "react"

import { type LucideIcon } from "lucide-react"

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
  FilterOptionList,
} from "./filter-segment"
import { parseISODuration } from "@/lib/temporal"
import { formatDuration } from "date-fns"

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
  const [opOpen, setOpOpen] = useState(false)

  // we only allow one operation at a time so we'll just grab the first pair
  const [currentOp] = Object.keys(filter.value)
  const currentValue = filter.value[currentOp]

  const ops = options.map((o) => ({ label: o.label, value: o.op }))
  const selected = options.find((o) => o.op === currentOp) ?? options[0]

  const displayValue = formatDuration(parseISODuration(currentValue))

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
      onDraft={filter.handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterPopoverSegment
        className="w-28"
        open={opOpen}
        onOpenChange={setOpOpen}
        popover={(close) => (
          <FilterOptionList
            options={ops}
            value={currentOp}
            onSelect={(op) => {
              handleOpChange(op)
              close()
            }}
          />
        )}
      >
        {selected.label.toLowerCase()}
      </FilterPopoverSegment>
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
  const [open, setOpen] = useState(false)

  return (
    <FilterPopoverSegment
      className="w-28"
      open={open}
      onOpenChange={setOpen}
      popover={(close) => (
        <FilterOptionList
          options={options}
          value={value}
          onSelect={(v) => {
            onSelect(v)
            close()
          }}
        />
      )}
    >
      {displayValue || (
        <span className="bg-background-2/60 text-content-disabled italic hover:brightness-125">
          select...
        </span>
      )}
    </FilterPopoverSegment>
  )
}
