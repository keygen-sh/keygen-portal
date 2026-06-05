import { type ReactNode, type RefObject } from "react"

import { cn } from "@/lib/utils"

interface CursorTooltipProps {
  open: boolean
  tooltipRef: RefObject<HTMLDivElement | null>
  currentPos: { x: number; y: number }
  offset?: number
  interactive?: boolean
  className?: string
  children: ReactNode
}

export default function CursorTooltip({
  open,
  tooltipRef,
  currentPos,
  offset = 12,
  interactive = false,
  className,
  children,
}: CursorTooltipProps): React.ReactElement | null {
  if (!open) return null

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-50 transition-transform duration-200 ease-out",
        !interactive && "pointer-events-none",
      )}
      style={{
        left: currentPos.x,
        top: currentPos.y,
        transform: `translate(-50%, ${offset}px)`,
      }}
    >
      <div
        className={cn(
          "rounded-md border border-accent bg-background-2 p-3 text-xs shadow-lg duration-150 animate-in fade-in-0 zoom-in-95",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
