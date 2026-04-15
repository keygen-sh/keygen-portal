import { useState, useRef } from "react"
import { type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import { type FilterState, useFilterState } from "@/hooks/use-filter-state"
import { FilterSegmentGroup, FilterSegment } from "./filter-segment"

export interface StringFilterProps {
  label: string
  icon?: LucideIcon
  placeholder?: string
  value?: string
  onChange: (value: string | undefined) => void
}

export default function StringFilter({
  label,
  icon,
  placeholder,
  value,
  onChange,
}: StringFilterProps) {
  const filter = useFilterState(value, "", onChange)
  const [open, setOpen] = useState(false)

  function handleDraft() {
    filter.handleDraft()
    setOpen(true)
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
      confirmDisabled={!filter.value}
    >
      <FilterSegment>{label}</FilterSegment>
      <StringInputSegment
        state={filter.state}
        value={filter.value}
        placeholder={placeholder}
        open={open}
        onOpenChange={setOpen}
        onChange={(next) => {
          if (next) {
            filter.handleChange(next)
          } else {
            filter.handleDeactivate()
          }
        }}
      />
    </FilterSegmentGroup>
  )
}

function StringInputSegment({
  state,
  value,
  placeholder,
  open,
  onOpenChange,
  onChange,
}: {
  state: FilterState
  value: string
  placeholder?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: string | undefined) => void
}) {
  const isActive = state === "active"
  const isDraft = state === "draft"

  const [internalValue, setInternalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit() {
    const trimmed = internalValue.trim()
    onChange(trimmed || undefined)
    onOpenChange(false)
  }

  function handleCancel() {
    setInternalValue(value)
    onOpenChange(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true)
        } else {
          handleCancel()
        }
      }}
    >
      <PopoverTrigger asChild>
        {isActive ? (
          <button
            type="button"
            className="inline-flex h-full cursor-pointer items-center bg-secondary/20 px-0.5 text-xs text-secondary transition-colors outline-none hover:text-secondary-light"
          >
            {value}
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              "inline-flex h-full cursor-pointer items-center px-0.5 text-xs transition-colors outline-none",
              isDraft
                ? "bg-background-2/60 text-content-disabled italic hover:brightness-125"
                : "bg-secondary/20 text-secondary hover:text-secondary-light",
            )}
          >
            edit...
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 !bg-background p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div>
          <div className="p-3">
            <Input
              ref={inputRef}
              fieldSize="sm"
              placeholder={placeholder ?? "Enter a value..."}
              value={internalValue}
              onChange={(e) => setInternalValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
            />
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
              onClick={handleSubmit}
              disabled={!internalValue.trim()}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
