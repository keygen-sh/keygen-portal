import { useState } from "react"
import { type DateRange } from "react-day-picker"
import { format, formatISO, parseISO, differenceInCalendarDays } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"

import { FilterSegmentGroup, FilterSegment } from "./filter-segment"

const DEFAULT_MAX_RANGE_DAYS = 31

export interface DateRangeValue {
  start?: string
  end?: string
}

export interface DateRangeFilterProps {
  label: string
  icon?: LucideIcon
  maxRangeDays?: number
  value?: DateRangeValue
  onChange: (value: DateRangeValue | undefined) => void
}

function toCalendarRange(value: DateRangeValue): DateRange | undefined {
  if (!value.start && !value.end) return undefined
  return {
    from: value.start ? parseISO(value.start) : undefined,
    to: value.end ? parseISO(value.end) : undefined,
  }
}

function validateRange(
  range: DateRange | undefined,
  maxRangeDays: number,
): { message: string; isError: boolean; valid: boolean } {
  if (!range?.from || !range.to) {
    return {
      message: `Pick a start and end date — up to ${maxRangeDays} days.`,
      isError: false,
      valid: false,
    }
  }

  const diff = differenceInCalendarDays(range.to, range.from)
  if (diff < 1) {
    return {
      message: "End date must be after the start date.",
      isError: true,
      valid: false,
    }
  }
  if (diff > maxRangeDays) {
    return {
      message: `Range can be at most ${maxRangeDays} days.`,
      isError: true,
      valid: false,
    }
  }

  return { message: "", isError: false, valid: true }
}

export default function DateRangeFilter({
  label,
  icon,
  maxRangeDays = DEFAULT_MAX_RANGE_DAYS,
  value,
  onChange,
}: DateRangeFilterProps) {
  const filter = useFilterState<DateRangeValue>(value, {}, onChange)
  const [open, setOpen] = useState(false)

  function handleDraft() {
    filter.handleDraft()
    setOpen(true)
  }

  const { start, end } = filter.value
  const displayValue =
    start && end
      ? `${format(parseISO(start), "MMM d")} – ${format(parseISO(end), "MMM d, yyyy")}`
      : "select..."

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
      confirmDisabled={!(start && end)}
    >
      <FilterSegment>{label}</FilterSegment>
      <DateRangeSegment
        state={filter.state}
        value={filter.value}
        displayValue={displayValue}
        maxRangeDays={maxRangeDays}
        open={open}
        onOpenChange={setOpen}
        onApply={filter.handleChange}
      />
    </FilterSegmentGroup>
  )
}

function DateRangeSegment({
  state,
  value,
  displayValue,
  maxRangeDays,
  open,
  onOpenChange,
  onApply,
}: {
  state: FilterState
  value: DateRangeValue
  displayValue: string
  maxRangeDays: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (value: DateRangeValue) => void
}) {
  const isDraft = state === "draft"

  const [range, setRange] = useState<DateRange | undefined>(() =>
    toCalendarRange(value),
  )

  const validation = validateRange(range, maxRangeDays)

  function handleApply() {
    if (!range?.from || !range.to || !validation.valid) return

    onApply({
      start: formatISO(range.from, { representation: "date" }),
      end: formatISO(range.to, { representation: "date" }),
    })
    onOpenChange(false)
  }

  function handleCancel() {
    setRange(toCalendarRange(value))
    onOpenChange(false)
  }

  function handleOpen() {
    setRange(toCalendarRange(value))
    onOpenChange(true)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          handleOpen()
        } else {
          handleCancel()
        }
      }}
    >
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
          {displayValue}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto !bg-background p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
          />
          <p
            className={cn(
              "px-1 pt-1 text-xs",
              validation.isError ? "text-destructive" : "text-content-subdued",
            )}
          >
            {validation.message || `Up to ${maxRangeDays} days.`}
          </p>
        </div>
        <div className="flex items-center gap-2 border-t p-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 rounded-sm text-sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 rounded-sm text-sm"
            onClick={handleApply}
            disabled={!validation.valid}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
