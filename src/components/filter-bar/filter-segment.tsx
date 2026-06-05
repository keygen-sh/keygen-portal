import { useCallback, useContext, useMemo, useRef, useState } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

import { ChevronDown, Check, X, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  type FilterState,
  FilterStateContext,
} from "@/contexts/filter-bar-context"
import { optionMatchesQuery, renderHighlightedText } from "./filter-options"

const MAX_VISIBLE_OPTIONS = 8

export function FilterSegmentGroup({
  state,
  icon: Icon,
  label,
  onDraft,
  onActivate,
  onDeactivate,
  confirmDisabled,
  hideActiveRemove,
  children,
}: {
  state: FilterState
  icon?: LucideIcon
  label: string
  onDraft?: () => void
  onActivate?: () => void
  onDeactivate?: () => void
  confirmDisabled?: boolean
  hideActiveRemove?: boolean
  children: React.ReactNode
}) {
  const isInactive = state === "inactive"
  const isDraft = state === "draft"

  return (
    <FilterStateContext.Provider value={state}>
      <div
        role={isInactive ? "button" : undefined}
        tabIndex={isInactive ? 0 : undefined}
        onClick={isInactive ? onDraft : undefined}
        onKeyDown={
          isInactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onDraft?.()
                }
              }
            : undefined
        }
        className={cn(
          "flex h-full shrink-0 items-center overflow-hidden rounded-[3px] text-xs font-normal whitespace-nowrap outline-1 -outline-offset-1 outline-transparent outline-dashed select-none",
          isInactive &&
            "cursor-pointer gap-1 bg-background-2 text-content-loud transition-colors hover:bg-background-3 focus-visible:ring-2 focus-visible:ring-content-subdued focus-visible:ring-offset-1",
          isDraft && "outline-muted/50",
        )}
      >
        {isInactive ? (
          <span className="inline-flex h-full items-center px-1.5">
            {Icon && <Icon className="size-3 text-content-muted" />}
            <span className="px-1 text-content-muted">{label}</span>
            <ChevronDown className="size-3 text-content-subdued" />
          </span>
        ) : (
          <>
            {Icon && (
              <span
                className={cn(
                  "inline-flex h-full items-center pr-0.5 pl-1.5",
                  isDraft
                    ? "bg-background-2/60 text-content-subdued"
                    : "bg-secondary/20 text-secondary/70",
                )}
              >
                <Icon className="size-3" />
              </span>
            )}
            {children}

            {isDraft ? (
              <>
                <button
                  type="button"
                  onClick={onDeactivate}
                  className="inline-flex h-full cursor-pointer items-center bg-background-2/60 pr-0.5 pl-1 text-content-subdued transition-colors outline-none hover:text-destructive"
                  aria-label="Discard filter"
                >
                  <X className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={onActivate}
                  disabled={confirmDisabled}
                  className={cn(
                    "inline-flex h-full items-center bg-background-2/60 pr-1.5 pl-0.5 transition-colors outline-none",
                    confirmDisabled
                      ? "cursor-not-allowed text-content-disabled"
                      : "cursor-pointer text-content-subdued hover:text-primary",
                  )}
                  aria-label="Apply filter"
                >
                  <Check className="size-3" />
                </button>
              </>
            ) : !hideActiveRemove ? (
              <button
                type="button"
                onClick={onDeactivate}
                className="inline-flex h-full cursor-pointer items-center bg-secondary/20 pr-1.5 pl-1 text-secondary/70 transition-colors outline-none hover:text-secondary"
                aria-label="Remove filter"
              >
                <X className="size-3" />
              </button>
            ) : null}
          </>
        )}
      </div>
    </FilterStateContext.Provider>
  )
}

export function FilterSegment({ children }: { children?: React.ReactNode }) {
  const state = useContext(FilterStateContext)
  const isDraft = state === "draft"

  return (
    <span
      className={cn(
        "inline-flex h-full items-center gap-1 px-0.5 text-xs transition-colors",
        isDraft
          ? "bg-background-2/60 text-content-subdued"
          : "bg-secondary/20 text-secondary/70",
      )}
    >
      {children}
    </span>
  )
}

export function FilterPopoverSegment({
  popover,
  className,
  open,
  onOpenChange,
  children,
}: {
  popover: React.ReactNode | ((close: () => void) => React.ReactNode)
  className?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  const state = useContext(FilterStateContext)
  const isDraft = state === "draft"

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-full cursor-pointer items-center gap-1 px-0.5 text-xs transition-colors outline-none",
            isDraft
              ? "bg-background-2/60 text-content-muted hover:brightness-125"
              : "bg-secondary/20 text-secondary hover:text-secondary-light",
          )}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("p-1", className)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {typeof popover === "function"
          ? popover(() => onOpenChange(false))
          : popover}
      </PopoverContent>
    </Popover>
  )
}

export function FilterOptionList({
  options,
  value,
  onSelect,
}: {
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string
  onSelect: (value: string) => void
}) {
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    node?.focus()
  }, [])

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery)
    setActiveIndex(0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
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
      onSelect(activeOption.value)
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
    <div
      ref={handleContainerRef}
      tabIndex={-1}
      className="outline-none"
      onKeyDown={handleKeyDown}
    >
      <ScrollArea
        className={cn(visibleOptions.length > MAX_VISIBLE_OPTIONS && "h-64")}
      >
        <div className="flex flex-col gap-0.5">
          {visibleOptions.length > 0 ? (
            visibleOptions.map((opt, index) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "w-full cursor-pointer rounded-sm px-2 py-1 text-left text-xs transition-colors hover:bg-accent",
                  opt.value === value && "bg-accent",
                  index === normalizedActiveIndex && "bg-accent",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => onSelect(opt.value)}
              >
                {renderHighlightedText(opt.label, query.trim())}
              </button>
            ))
          ) : (
            <div className="px-2 py-1 text-xs text-content-subdued">
              No results found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
