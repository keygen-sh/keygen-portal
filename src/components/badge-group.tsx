import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"

type BadgeGroupProps = {
  children: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  desktopMax?: number
  mobileMax?: number
  className?: string
  popoverClassName?: string
}

export function BadgeGroup({
  children,
  prefix,
  suffix,
  desktopMax = 4,
  mobileMax = 2,
  className,
  popoverClassName,
}: BadgeGroupProps): React.ReactElement {
  const isMobile = useMobile()

  const flat = React.Children.toArray(children).filter(Boolean)

  const max = isMobile ? Math.max(0, mobileMax) : desktopMax
  const visible = flat.slice(0, max)
  const hidden = flat.slice(max)
  const overflow = hidden.length

  return (
    <span className={cn("flex flex-wrap items-center gap-1", className)}>
      {prefix != null && <span>{prefix}</span>}

      {visible.map((child, i) => (
        <span key={(child as any)?.key ?? i}>{child}</span>
      ))}

      {overflow > 0 && (
        <Popover>
          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Badge variant="secondary" className="cursor-pointer select-none">
              +{overflow}
            </Badge>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            className={cn("w-fit bg-background p-2", popoverClassName)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {hidden.map((child, i) => (
                <span key={(child as any)?.key ?? `hidden-${i}`}>{child}</span>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {suffix != null && <span>{suffix}</span>}
    </span>
  )
}

type BadgeGroupItemProps = {
  children: React.ReactNode
  className?: string
}

export function BadgeGroupItem({
  children,
  className,
}: BadgeGroupItemProps): React.ReactElement {
  return (
    <Badge variant="secondary" className={className}>
      {children}
    </Badge>
  )
}
