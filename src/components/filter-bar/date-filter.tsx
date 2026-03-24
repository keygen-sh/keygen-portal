import { useState, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { type LucideIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import * as Calendars from "@/components/calendars"

import { cn } from "@/lib/utils"

import { useFilterStateContext } from "@/contexts/filter-bar-context"
import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"

export function DateSegment({
  value,
  displayValue,
  onDateApply,
}: {
  value: string
  displayValue: string
  onDateApply: (date: Date | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const state = useFilterStateContext()
  const isDraft = state === "draft"

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
          {displayValue || "pick date..."}
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
            onDateApply(date)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

export interface DateFilterProps {
  label: string
  icon?: LucideIcon
  ops: ReadonlyArray<{ value: string; label: string }>
  value?: Record<string, string>
  onChange: (value: Record<string, string> | undefined) => void
}

export default function DateFilter({
  label,
  icon,
  ops,
  value,
  onChange,
}: DateFilterProps) {
  const defaultValue = useMemo(() => ({ [ops[0].value]: "" }), [ops])

  const {
    filterState,
    currentValue,
    handleActivate,
    handleConfirm,
    handleRemove,
    handleChange,
    handleDraftChange,
  } = useFilterState(value, defaultValue, onChange)

  const currentOp = Object.keys(currentValue)[0]
  const currentVal = Object.values(currentValue)[0]
  const opLabel =
    ops.find((o) => o.value === currentOp)?.label?.toLowerCase() ?? currentOp
  const displayValue = currentVal ? format(parseISO(currentVal), "PPP") : ""

  function handleOpSelect(op: string) {
    if (currentVal) {
      handleChange({ [op]: currentVal })
    } else {
      handleDraftChange({ [op]: "" })
    }
  }

  function handleDateApply(date: Date | undefined) {
    if (date) {
      handleChange({ [currentOp]: format(date, "yyyy-MM-dd") })
    }
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
      <DateSegment
        value={currentVal}
        displayValue={displayValue}
        onDateApply={handleDateApply}
      />
    </FilterSegmentGroup>
  )
}
