import type React from "react"

import { Badge } from "@/components/ui/badge"
import TooltipBadge from "@/components/tooltip-badge"

import { cn } from "@/lib/utils"

export type LimitBadgeProps = {
  value: string
  enabled: boolean
  tooltip: string
  hoverValue?: string
  overridden?: boolean
  wrap?: boolean
}

export function OverriddenBadge({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <Badge variant="secondary" className={cn("ml-1.5 text-[10px]", className)}>
      Overridden
    </Badge>
  )
}

export default function LimitBadge({
  value,
  enabled,
  tooltip,
  hoverValue,
  overridden = false,
  wrap = false,
}: LimitBadgeProps): React.ReactElement {
  return (
    <span className="group/license-limit flex flex-wrap items-center gap-1.5">
      <TooltipBadge
        value={value}
        variant={enabled ? "default" : "disabled"}
        hoverValue={hoverValue}
        tooltip={tooltip}
        suffix={overridden && <OverriddenBadge />}
        wrap={wrap}
      />
    </span>
  )
}
