import React from "react"
import { cn } from "@/lib/utils"
import { Badge, type BadgeVariant } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Info } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

type TooltipBadgeProps<T> = {
  value: T
  icon?: React.ReactNode
  tooltip: string
  variant?: BadgeVariant
  className?: string
}

export default function TooltipBadge<T>({
  value,
  icon,
  tooltip,
  variant,
  className,
}: TooltipBadgeProps<T>) {
  const isMobile = useMobile()

  const badge = (
    <Badge
      asChild
      variant={variant}
      className={cn("group pl-2 text-sm", className)}
    >
      <span className="inline-flex items-center">
        {icon ? <span className="size-3">{icon}</span> : null}
        <span className="cursor-default">{String(value)}</span>

        <span className="pointer-events-none ml-0 inline-flex w-0 overflow-hidden transition-[width,margin] duration-200 ease-out group-hover:ml-1 group-hover:w-3">
          <Info
            aria-hidden
            className="size-3 shrink-0 origin-right translate-x-2 scale-0 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100"
          />
        </span>
      </span>
    </Badge>
  )

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>{badge}</PopoverTrigger>
        <PopoverContent className="mr-2 max-w-72 bg-accent text-pretty text-content-loud">
          {tooltip}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="pointer-events-none max-w-72 bg-accent text-pretty text-content-loud"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
