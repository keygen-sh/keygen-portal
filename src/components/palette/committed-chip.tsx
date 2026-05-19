import { X } from "lucide-react"

import type { SearchChip } from "@/types/palette"

export interface CommittedChipProps {
  chip: SearchChip
  onRemove: () => void
}

export default function CommittedChip({ chip, onRemove }: CommittedChipProps) {
  return (
    <div className="flex h-6 shrink-0 items-center overflow-hidden rounded-[3px] text-xs font-normal whitespace-nowrap">
      <span className="inline-flex h-full items-center bg-secondary/20 pr-0.5 pl-1.5 text-secondary/70">
        {chip.keyword}:
      </span>
      <span className="inline-flex h-full items-center bg-secondary/20 px-1 text-secondary/70">
        {chip.value}
      </span>
      <button
        type="button"
        aria-label={`Remove ${chip.keyword} filter`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="inline-flex h-full cursor-pointer items-center bg-secondary/20 pr-1.5 pl-0.5 text-secondary/70 transition-colors outline-none hover:text-secondary"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
