import { useState, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { useFilterStateContext } from "@/contexts/filter-bar-context"
import { useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment, OptionList } from "./filter-segment"

export interface NumericFilterProps {
  label: string
  icon?: LucideIcon
  ops: ReadonlyArray<{ value: string; label: string }>
  defaultOp: string
  defaultCount: number
  value?: Record<string, number>
  onChange: (value: Record<string, number> | undefined) => void
}

export default function NumericFilter({
  label,
  icon,
  ops,
  defaultOp,
  defaultCount,
  value,
  onChange,
}: NumericFilterProps) {
  const defaultValue = useMemo(
    () => ({ [defaultOp]: defaultCount }),
    [defaultOp, defaultCount],
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
  const currentCount = Object.values(currentValue)[0]
  const opLabel =
    ops.find((o) => o.value === currentOp)?.label?.toLowerCase() ?? currentOp

  function handleOpSelect(op: string) {
    handleChange({ [op]: currentCount })
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
        popoverClassName="w-32"
      >
        {opLabel}
      </FilterSegment>

      <NumericCountSegment
        count={currentCount}
        onApply={(num) => handleChange({ [currentOp]: num })}
      />
    </FilterSegmentGroup>
  )
}

function NumericCountSegment({
  count,
  onApply,
}: {
  count: number
  onApply: (value: number) => void
}) {
  const state = useFilterStateContext()
  const isDraft = state === "draft"
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(String(count))

  function handleOpenChange(next: boolean) {
    if (next) setInput(String(count))
    setOpen(next)
  }

  function handleApply() {
    const num = parseInt(input, 10)
    if (!isNaN(num)) {
      onApply(num)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
            isDraft
              ? "bg-background-2/60 text-content-muted hover:brightness-125"
              : "bg-secondary/20 text-secondary hover:text-secondary-light",
          )}
        >
          {count}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-48 !bg-background p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div>
          <div className="p-2">
            <Input
              type="number"
              min={0}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApply()
              }}
              fieldSize="sm"
              className="w-full"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
