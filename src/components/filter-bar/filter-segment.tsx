import { useCallback, useContext, useState } from "react"
import { ChevronDown, Check, X, type LucideIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import {
  FilterStateContext,
  type FilterState,
} from "@/contexts/filter-bar-context"

export function FilterSegmentGroup({
  state,
  icon: Icon,
  label,
  onActivate,
  onConfirm,
  onRemove,
  confirmDisabled,
  hideActiveRemove,
  children,
}: {
  state: FilterState
  icon?: LucideIcon
  label: string
  onActivate?: () => void
  onConfirm?: () => void
  onRemove?: () => void
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
        onClick={isInactive ? onActivate : undefined}
        onKeyDown={
          isInactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onActivate?.()
                }
              }
            : undefined
        }
        className={cn(
          "flex h-full shrink-0 items-center overflow-hidden rounded-[3px] text-xs font-normal whitespace-nowrap outline-1 -outline-offset-1 outline-dashed select-none",
          isInactive &&
            "cursor-pointer gap-1 bg-background-2 px-1 text-content-loud outline-transparent transition-colors hover:bg-background-3 focus-visible:ring-2 focus-visible:ring-content-subdued focus-visible:ring-offset-1",
          isDraft && "outline-muted/50",
          !isInactive && !isDraft && "outline-transparent",
        )}
      >
        {isInactive ? (
          <>
            {Icon && <Icon className="size-3 text-content-muted" />}
            <span className="text-content-muted">{label}</span>
            <ChevronDown className="size-3 text-content-subdued" />
          </>
        ) : (
          <>
            {Icon && (
              <span
                className={cn(
                  "inline-flex h-full items-center pr-0.5 pl-1",
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
                  onClick={onRemove}
                  className="inline-flex h-full cursor-pointer items-center bg-background-2/60 px-1 text-content-subdued transition-colors outline-none hover:text-destructive"
                  aria-label="Discard filter"
                >
                  <X className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                  className={cn(
                    "inline-flex h-full items-center bg-background-2/60 px-1 transition-colors outline-none",
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
                onClick={onRemove}
                className="inline-flex h-full cursor-pointer items-center bg-secondary/20 px-1 text-secondary/70 transition-colors outline-none hover:text-secondary"
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

export function FilterSegment({
  clickable = false,
  popover,
  popoverClassName,
  children,
}: {
  clickable?: boolean
  popover?: React.ReactNode | ((close: () => void) => React.ReactNode)
  popoverClassName?: string
  children?: React.ReactNode
}) {
  const state = useContext(FilterStateContext)
  const isDraft = state === "draft"

  const baseStyles = cn(
    "inline-flex h-full items-center gap-1 px-0.5 text-xs transition-colors",
    isDraft
      ? "bg-background-2/60 text-content-muted"
      : "bg-secondary/20 text-secondary/70",
  )

  const content = children

  if (!clickable || !popover) {
    return (
      <span
        className={cn(
          baseStyles,
          isDraft ? "text-content-subdued" : "text-secondary/70",
        )}
      >
        {content}
      </span>
    )
  }

  return (
    <SegmentPopover
      popover={popover}
      popoverClassName={popoverClassName}
      triggerClassName={cn(
        baseStyles,
        isDraft
          ? "hover:brightness-125"
          : "text-secondary hover:text-secondary-light",
      )}
    >
      {content}
    </SegmentPopover>
  )
}

export function SegmentPopover({
  popover,
  popoverClassName,
  triggerClassName,
  children,
}: {
  popover: React.ReactNode | ((close: () => void) => React.ReactNode)
  popoverClassName?: string
  triggerClassName?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(triggerClassName, "cursor-pointer outline-none")}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("!bg-background p-1", popoverClassName)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {typeof popover === "function" ? popover(close) : popover}
      </PopoverContent>
    </Popover>
  )
}

export function OptionList({
  options,
  value,
  onSelect,
}: {
  options: ReadonlyArray<{ value: string; label: string }>
  value?: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(
            "w-full cursor-pointer rounded-sm px-2 py-1 text-left text-xs transition-colors hover:bg-accent",
            opt.value === value && "bg-accent",
          )}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
