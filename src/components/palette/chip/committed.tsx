import { X } from "lucide-react"

import { cn } from "@/lib/utils"

import type { SearchChip } from "@/types/palette"

export interface CommittedProps {
  chip: SearchChip
  invalid?: boolean
  onRemove: () => void
}

export default function Committed({
  chip,
  invalid = false,
  onRemove,
}: CommittedProps) {
  const keywordClassName = cn(
    "inline-flex h-full items-center bg-secondary text-white/70 dark:bg-secondary/20 dark:text-secondary/70",
    invalid &&
      "bg-destructive text-white dark:bg-destructive/20 dark:text-destructive",
  )
  const valueClassName = cn(
    "inline-flex h-full items-center bg-secondary text-white dark:bg-secondary/20 dark:text-secondary",
    invalid &&
      "bg-destructive text-white dark:bg-destructive/20 dark:text-destructive",
  )

  return (
    <div
      aria-invalid={invalid || undefined}
      className="flex h-6 shrink-0 items-center overflow-hidden rounded-[3px] text-xs font-normal whitespace-nowrap"
    >
      <span className={cn(keywordClassName, "pr-0.5 pl-1.5")}>
        {chip.keyword}:
      </span>
      <span className={cn(valueClassName, "px-1")}>{chip.value}</span>
      <button
        type="button"
        aria-label={`Remove ${chip.keyword} filter`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className={cn(
          "inline-flex h-full cursor-pointer items-center bg-secondary pr-1.5 pl-0.5 text-white/70 transition-colors outline-none hover:text-white dark:bg-secondary/20 dark:text-secondary/70 dark:hover:text-secondary",
          invalid &&
            "bg-destructive text-white hover:text-white dark:bg-destructive/20 dark:text-destructive dark:hover:text-destructive",
        )}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
