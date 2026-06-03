import { useEffect, useMemo, useRef, useState } from "react"
import { Check, type LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cn } from "@/lib/utils"

import { useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
} from "./filter-segment"

export interface SearchSelectFilterProps {
  label: string
  icon?: LucideIcon
  placeholder?: string
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string[]
  onChange: (value: string[] | undefined) => void
}

export default function SearchSelectFilter({
  label,
  icon,
  placeholder,
  options,
  value,
  onChange,
}: SearchSelectFilterProps) {
  const filter = useFilterState<string[]>(value, [], onChange)

  const selected = filter.value
  const displayValue =
    selected.length === 0
      ? "select..."
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
        : `${selected.length} selected`

  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option]

    if (next.length > 0) {
      filter.handleChange(next)
    } else {
      filter.handleDeactivate()
    }
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={filter.handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
      confirmDisabled={selected.length === 0}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>in</FilterSegment>
      <FilterPopoverSegment
        className="w-64"
        popover={() => (
          <SearchSelectList
            options={options}
            selected={selected}
            placeholder={placeholder}
            onToggle={toggle}
          />
        )}
      >
        {displayValue}
      </FilterPopoverSegment>
    </FilterSegmentGroup>
  )
}

function SearchSelectList({
  options,
  selected,
  placeholder,
  onToggle,
}: {
  options: ReadonlyArray<{ value: string; label: string }>
  selected: string[]
  placeholder?: string
  onToggle: (option: string) => void
}) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    )
  }, [options, query])

  return (
    <div className="flex flex-col gap-1">
      <Input
        ref={inputRef}
        fieldSize="sm"
        placeholder={placeholder ?? "Search..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ScrollArea className="max-h-64">
        <div className="flex flex-col gap-0.5">
          {filtered.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-content-subdued">
              No matches
            </p>
          ) : (
            filtered.map((option) => {
              const isSelected = selected.includes(option.value)

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1 text-left text-xs transition-colors hover:bg-accent",
                    isSelected && "bg-accent",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="size-3 shrink-0 text-secondary" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
