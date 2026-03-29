import { useState } from "react"
import { format, parseISO } from "date-fns"
import { type LucideIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import * as Calendars from "@/components/calendars"

import { cn } from "@/lib/utils"

import { FilterState, useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
  FilterOptionList,
} from "./filter-segment"

export type DateOption = {
  label: string
  op: "on" | "before" | "after"
}

export interface DateFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<DateOption>
  value?: Record<string, string>
  onChange: (value: Record<string, string> | undefined) => void
}

export default function DateFilter({
  label,
  icon,
  options,
  value,
  onChange,
}: DateFilterProps) {
  const filter = useFilterState(value, {}, onChange)

  // we only allow one operation at a time so we'll just grab the first pair
  const [currentOp] = Object.keys(filter.value)
  const currentValue = filter.value[currentOp]

  const ops = options.map((o) => ({ label: o.label, value: o.op }))
  const selected = options.find((o) => o.op === currentOp) ?? options[0]

  const displayValue = currentValue ? format(parseISO(currentValue), "PPP") : ""

  function handleOpChange(op: string) {
    if (currentValue) {
      filter.handleChange({ [op]: currentValue })
    } else {
      filter.handleDraftChange({ [op]: "" })
    }
  }

  function handleDateChange(date: Date | undefined) {
    if (date) {
      filter.handleChange({ [selected.op]: format(date, "yyyy-MM-dd") })
    }
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onActivate={filter.handleActivate}
      onConfirm={filter.handleConfirm}
      onRemove={filter.handleRemove}
      confirmDisabled={!currentValue}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterPopoverSegment
        className="w-28"
        popover={(close) => (
          <FilterOptionList
            options={ops}
            value={currentOp}
            onSelect={(v) => {
              handleOpChange(v)
              close()
            }}
          />
        )}
      >
        {selected.label.toLowerCase()}
      </FilterPopoverSegment>
      <DatePickerSegment
        state={filter.state}
        value={currentValue}
        displayValue={displayValue}
        onSelect={handleDateChange}
      />
    </FilterSegmentGroup>
  )
}

export function DatePickerSegment({
  state,
  value,
  displayValue,
  onSelect,
}: {
  state: FilterState
  value: string
  displayValue: string
  onSelect: (date: Date | undefined) => void
}) {
  const isDraft = state === "draft"
  const [open, setOpen] = useState(false)

  const selectedDate = value ? parseISO(value) : undefined
  const validDate =
    selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
            isDraft
              ? "bg-background-2/60 text-content-disabled italic hover:brightness-125"
              : "bg-secondary/20 text-secondary hover:text-secondary-light",
          )}
        >
          {displayValue || "select..."}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto !bg-background p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Calendars.DatePicker
          selected={validDate}
          onApply={(date) => {
            onSelect(date)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
