import type { ReactNode } from "react"

import type { Keyword } from "@/types/palette"

export interface PendingProps {
  keyword: Keyword
  children: ReactNode
}

export default function Pending({ keyword, children }: PendingProps) {
  return (
    <div className="flex h-6 min-w-[120px] flex-1 items-center overflow-hidden rounded-[3px] text-xs font-normal whitespace-nowrap outline-1 -outline-offset-1 outline-muted/50 outline-dashed">
      <span className="inline-flex h-full shrink-0 items-center bg-background-2/60 pr-0.5 pl-1.5 text-content-subdued">
        {keyword}:
      </span>
      {children}
    </div>
  )
}
