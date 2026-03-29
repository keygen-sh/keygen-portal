import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { FilterState, useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
  FilterOptionList,
} from "./filter-segment"

type NumericOption = {
  label: string
  op: "eq" | "lt" | "lte" | "gt" | "gte"
}

export interface NumericFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<NumericOption>
  value?: Record<string, number>
  onChange: (value: Record<string, number> | undefined) => void
}

export default function NumericFilter({
  label,
  icon,
  options,
  value, // partial filter e.g. {eq: 1}
  onChange,
}: NumericFilterProps) {
  const filter = useFilterState(value, {}, onChange)

  // we only allow one operation at a time so we'll just grab the first pair
  const [currentOp] = Object.keys(filter.value)
  const currentValue = filter.value[currentOp]

  const ops = options.map((o) => ({ label: o.label, value: o.op }))
  const selected = options.find((o) => o.op === currentOp) ?? options[0]

  function handleOpChange(op: string) {
    filter.handleChange({ [op]: currentValue })
  }

  function handleValueChange(value: number) {
    filter.handleChange({ [selected.op]: value })
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      confirmDisabled={!currentValue}
      onActivate={filter.handleActivate}
      onConfirm={filter.handleConfirm}
      onRemove={filter.handleRemove}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterPopoverSegment
        className="w-32"
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

      <NumberInputSegment
        state={filter.state}
        onChange={handleValueChange}
        value={currentValue}
      />
    </FilterSegmentGroup>
  )
}

export function NumberInputSegment({
  state,
  value,
  onChange,
}: {
  state: FilterState
  onChange: (value: number) => void
  value: number
}) {
  const isDraft = state === "draft"
  const [open, setOpen] = useState(false)

  // keep internal state so we can edit without immediately propagating changes
  const [internalValue, setInternalValue] = useState<number | null>(value)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

  function handleValueChange(nextValue: number | null) {
    setInternalValue(nextValue)
  }

  function handleCancel() {
    setOpen(false)
  }

  function handleSubmit() {
    if (internalValue) {
      onChange(internalValue)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
          {value || "edit..."}
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
              className="w-full"
              fieldSize="sm"
              autoFocus
              type="number"
              min={0}
              value={internalValue ?? ""}
              onChange={(e) =>
                handleValueChange(
                  e.target.value ? parseInt(e.target.value) : null,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit()
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={() => handleCancel()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 rounded-sm text-sm"
              onClick={() => handleSubmit()}
              disabled={!internalValue}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
