import type { Keyword } from "@/types/palette"

export interface PendingChipProps {
  keyword: Keyword
}

export default function PendingChip({ keyword }: PendingChipProps) {
  return (
    <div className="flex h-6 shrink-0 items-center overflow-hidden rounded-[3px] text-xs font-normal whitespace-nowrap outline-1 -outline-offset-1 outline-muted/50 outline-dashed">
      <span className="inline-flex h-full items-center bg-background-2/60 px-1.5 text-content-subdued">
        {keyword}:
      </span>
    </div>
  )
}
