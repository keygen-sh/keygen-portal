import { useCallback, useMemo, useRef, useState } from "react"

import { type LucideIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"

import { useFilterState } from "@/hooks/use-filter-state"
import {
  FilterSegmentGroup,
  FilterSegment,
  FilterPopoverSegment,
} from "./filter-segment"
import { optionMatchesQuery, renderHighlightedText } from "./filter-options"

import { cn } from "@/lib/utils"

const MAX_VISIBLE_OPTIONS = 8

export interface ArrayFilterProps {
  label: string
  icon?: LucideIcon
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string[]
  onChange: (value: string[] | undefined) => void
}

export default function ArrayFilter({
  label,
  icon,
  options,
  value,
  onChange,
}: ArrayFilterProps) {
  const filter = useFilterState(value, [] as string[], onChange)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.filter((o) => filter.value.includes(o.value))
  const displayValue =
    selected.length > 0 ? (
      selected.map((o) => o.label).join(", ")
    ) : (
      <span className="text-content-disabled italic">select...</span>
    )

  const visibleOptions = useMemo(() => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return options

    return options.filter((option) => optionMatchesQuery(option, trimmedQuery))
  }, [options, query])

  const normalizedActiveIndex =
    visibleOptions.length > 0
      ? Math.min(activeIndex, visibleOptions.length - 1)
      : 0

  const activeOption = visibleOptions[normalizedActiveIndex]

  const handleContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node
      if (node && open) node.focus()
    },
    [open],
  )

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      setQuery("")
      setActiveIndex(0)
    }
  }

  function handleDraft() {
    filter.handleDraft()
    setQuery("")
    setActiveIndex(0)
    setOpen(true)
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery)
    setActiveIndex(0)
  }

  function selectOption(
    opt: { value: string; label: string },
    close: () => void,
    additive = false,
  ) {
    const isSelected = filter.value.includes(opt.value)

    if (additive) {
      const next = isSelected
        ? filter.value.filter((v) => v !== opt.value)
        : [...filter.value, opt.value]

      filter.handleDraftChange(next)
    } else {
      filter.handleChange([opt.value])
      close()
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLDivElement>,
    close: () => void,
  ) {
    if (e.key === "ArrowDown" && visibleOptions.length > 0) {
      e.preventDefault()
      setActiveIndex((current) => (current + 1) % visibleOptions.length)
      return
    }

    if (e.key === "ArrowUp" && visibleOptions.length > 0) {
      e.preventDefault()
      setActiveIndex(
        (current) =>
          (current - 1 + visibleOptions.length) % visibleOptions.length,
      )
      return
    }

    if (e.key === "Home" && visibleOptions.length > 0) {
      e.preventDefault()
      setActiveIndex(0)
      return
    }

    if (e.key === "End" && visibleOptions.length > 0) {
      e.preventDefault()
      setActiveIndex(visibleOptions.length - 1)
      return
    }

    if (e.key === "Enter" && activeOption) {
      e.preventDefault()
      selectOption(activeOption, close, e.ctrlKey || e.metaKey)
      return
    }

    if (e.key === "Backspace" && query) {
      e.preventDefault()
      updateQuery(query.slice(0, -1))
      return
    }

    if (e.key === "Escape" && query) {
      e.preventDefault()
      updateQuery("")
      return
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      updateQuery(query + e.key)
    }
  }

  return (
    <FilterSegmentGroup
      state={filter.state}
      icon={icon}
      label={label}
      onDraft={handleDraft}
      onActivate={filter.handleActivate}
      onDeactivate={filter.handleDeactivate}
      confirmDisabled={filter.value.length === 0}
    >
      <FilterSegment>{label}</FilterSegment>
      <FilterSegment>in</FilterSegment>
      <FilterPopoverSegment
        className="w-max max-w-96 min-w-44"
        open={open}
        onOpenChange={handleOpenChange}
        popover={(close) => (
          <div
            ref={handleContainerRef}
            tabIndex={-1}
            className="outline-none"
            onKeyDown={(e) => handleKeyDown(e, close)}
          >
            <ScrollArea
              className={cn(
                visibleOptions.length > MAX_VISIBLE_OPTIONS && "max-h-64",
              )}
            >
              <div className="flex flex-col gap-0.5">
                {visibleOptions.length > 0 ? (
                  visibleOptions.map((opt, index) => {
                    const isSelected = filter.value.includes(opt.value)

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={cn(
                          "w-full cursor-pointer rounded-sm px-2 py-1 text-left text-xs whitespace-nowrap transition-colors hover:bg-accent",
                          isSelected && "bg-accent",
                          index === normalizedActiveIndex && "bg-accent",
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={(e) =>
                          selectOption(opt, close, e.ctrlKey || e.metaKey)
                        }
                      >
                        {renderHighlightedText(opt.label, query.trim())}
                      </button>
                    )
                  })
                ) : (
                  <div className="px-2 py-1 text-xs text-content-subdued">
                    No results found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      >
        {displayValue}
      </FilterPopoverSegment>
    </FilterSegmentGroup>
  )
}
