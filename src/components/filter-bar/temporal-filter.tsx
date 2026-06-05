import { useState } from "react"

import { useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
  FilterOptionList,
} from "./filter-segment"
import { type DurationOption, DurationPickerSegment } from "./duration-filter"
import { type DateOption, DatePickerSegment } from "./date-filter"
import { parseISODuration } from "@/lib/temporal"
import { format, formatDuration, formatISO, parseISO } from "date-fns"
import { type LucideIcon } from "lucide-react"

export type TemporalDurationOption = DurationOption & {
  type: "duration"
}

export type TemporalDateOption = DateOption & {
  type: "date"
}

export type TemporalOption = TemporalDurationOption | TemporalDateOption

export interface TemporalFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<TemporalOption>
  value: Record<string, string> | undefined
  onChange: (value: Record<string, string> | undefined) => void
}

export default function TemporalFilter({
  label,
  icon,
  options,
  value, // partial filter object e.g. {within: "P1M"}
  onChange,
}: TemporalFilterProps) {
  const filter = useFilterState(value, {}, onChange)
  const [open, setOpen] = useState(false)

  // we only allow one operation at a time so we'll just grab the first pair
  const [currentOp] = Object.keys(filter.value)
  const currentValue = filter.value[currentOp]

  const ops = options.map((o) => ({ label: o.label, value: o.op }))
  const selected = options.find((o) => o.op === currentOp) ?? options[0]

  const displayValue =
    selected.type === "date"
      ? currentValue
        ? format(parseISO(currentValue), "PPP")
        : ""
      : formatDuration(parseISODuration(currentValue))

  function handleOpChange(op: string) {
    const nextSelected = options.find((o) => o.op === op)
    const nextValue =
      nextSelected && nextSelected.type === selected.type ? currentValue : ""

    if (nextValue) {
      filter.handleChange({ [op]: nextValue })
    } else {
      filter.handleDraftChange({ [op]: "" })
    }
  }

  function handleDurationChange(duration: string) {
    filter.handleChange({ [selected.op]: duration })
  }

  function handleDateChange(date: Date | undefined) {
    if (date) {
      const formattedValue = formatISO(date, { representation: "date" })

      filter.handleChange({ [selected.op]: formattedValue })
    }
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      confirmDisabled={!currentValue}
      onDraft={filter.handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterPopoverSegment
        className="w-28"
        open={open}
        onOpenChange={setOpen}
        popover={(close) => (
          <FilterOptionList
            options={ops}
            value={selected.op}
            onSelect={(op) => {
              handleOpChange(op)
              close()
            }}
          />
        )}
      >
        {selected.label.toLowerCase()}
      </FilterPopoverSegment>

      {selected.type === "date" ? (
        <DatePickerSegment
          state={filter.state}
          value={currentValue}
          displayValue={displayValue}
          onSelect={handleDateChange}
        />
      ) : (
        <DurationPickerSegment
          state={filter.state}
          options={selected.options}
          value={currentValue}
          displayValue={displayValue}
          onSelect={handleDurationChange}
        />
      )}
    </FilterSegmentGroup>
  )
}
