import type React from "react"

import { Badge } from "@/components/ui/badge"
import TooltipBadge from "@/components/tooltip-badge"

import { cn } from "@/lib/utils"
import { isLimitInherited, isLimitOverridden } from "@/lib/licenses"

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
    <Badge variant="secondary" className={cn("text-[10px]", className)}>
      Overridden
    </Badge>
  )
}

export function InheritedBadge({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <Badge variant="disabled" className={cn("text-[10px]", className)}>
      Inherited
    </Badge>
  )
}

export function LimitSourceBadge({
  value,
  policyValue,
}: {
  value: number | null | undefined
  policyValue: number | null
}): React.ReactElement | null {
  const limit = value ?? null

  if (isLimitOverridden(limit, policyValue)) return <OverriddenBadge />
  if (isLimitInherited(limit, policyValue)) return <InheritedBadge />

  return null
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
