import { useMemo } from "react"
import { format, parseISO } from "date-fns"

import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"
import { DateSegment } from "./date-filter"
import { isoToHumanDuration } from "@/lib/temporal"
import { type LucideIcon } from "lucide-react"

type TemporalOp = { value: string; label: string; type: "date" | "duration" }

export interface TemporalFilterProps {
  label: string
  icon?: LucideIcon
  ops: ReadonlyArray<TemporalOp>
  durations?: ReadonlyArray<{ label: string; iso: string }>
  value?: Record<string, string>
  onChange: (value: Record<string, string> | undefined) => void
}

export default function TemporalFilter({
  label,
  icon,
  ops,
  durations,
  value,
  onChange,
}: TemporalFilterProps) {
  const defaultValue = useMemo(() => {
    const firstOp = ops[0]
    const val = firstOp.type === "date" ? "" : (durations?.[0]?.iso ?? "")
    return { [firstOp.value]: val }
  }, [ops, durations])

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
  const currentVal = currentValue[currentOp]
  const opDef = ops.find((o) => o.value === currentOp)
  const opLabel = opDef?.label?.toLowerCase() ?? currentOp
  const isDateOp = opDef?.type === "date"

  function handleOpSelect(op: string) {
    const nextType = ops.find((o) => o.value === op)?.type
    const switchingToDate = nextType === "date" && !isDateOp
    const switchingFromDate = nextType !== "date" && isDateOp
    if (switchingToDate) {
      handleDraftChange({ [op]: "" })
    } else if (switchingFromDate) {
      const fallback = durations?.[0]?.iso
      if (fallback) {
        handleChange({ [op]: fallback })
      } else {
        handleDraftChange({ [op]: "" })
      }
    } else if (currentVal) {
      handleChange({ [op]: currentVal })
    } else {
      handleDraftChange({ [op]: "" })
    }
  }

  function handleDurationSelect(iso: string) {
    handleChange({ [currentOp]: iso })
  }

  function handleDateApply(date: Date | undefined) {
    if (date) {
      handleChange({ [currentOp]: format(date, "yyyy-MM-dd") })
    }
  }

  const displayValue = isDateOp
    ? currentVal
      ? format(parseISO(currentVal), "PPP")
      : ""
    : isoToHumanDuration(currentVal)

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

      {isDateOp ? (
        <DateSegment
          value={currentVal}
          displayValue={displayValue}
          onDateApply={handleDateApply}
        />
      ) : durations?.length ? (
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
      ) : null}
    </FilterSegmentGroup>
  )
}
