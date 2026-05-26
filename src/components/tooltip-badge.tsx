import React, { useState } from "react"

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

import { cn, splitLastWord } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"

import * as Motion from "@/components/motion"

type TooltipBadgeProps<T> = {
  value: T
  hoverValue?: T
  icon?: React.ReactNode
  tooltip: string
  suffix?: React.ReactNode
  wrap?: boolean
  variant?: BadgeVariant
  className?: string
}

export default function TooltipBadge<T>({
  value,
  hoverValue,
  icon,
  tooltip,
  suffix,
  wrap = false,
  variant,
  className,
}: TooltipBadgeProps<T>) {
  const isMobile = useMobile()
  const [hovered, setHovered] = useState(false)

  const tooltipSpace = (
    <span className="hidden [word-spacing:0.25em] group-hover/tooltip-badge:inline">
      {" "}
    </span>
  )
  const tooltipIcon = (
    <span className="pointer-events-none inline-flex w-0 transition-[width] duration-200 ease-out group-hover/tooltip-badge:w-3">
      <Info
        aria-hidden
        className="size-3 shrink-0 translate-x-3 opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover/tooltip-badge:translate-x-0 group-hover/tooltip-badge:opacity-100"
      />
    </span>
  )

  const suffixSlot = suffix ? (
    <span className="inline-flex align-middle [&_[data-slot=badge]]:ml-0">
      {suffix}
    </span>
  ) : null

  const renderValue = (displayValue: T) => {
    const { head, tail } = splitLastWord(String(displayValue))

    return (
      <>
        {head && <>{head} </>}
        {tail}
        {tooltipSpace}
        {tooltipIcon}
        {suffixSlot && <> {suffixSlot}</>}
      </>
    )
  }

  const badge = (
    <Badge
      asChild
      variant={variant}
      className={cn(
        "group/tooltip-badge cursor-default pl-2 text-sm",
        wrap && hovered && "overflow-visible whitespace-normal",
        className,
      )}
    >
      <span
        className={cn("inline-flex items-center", wrap && "flex-wrap")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {icon ? <span className="size-3">{icon}</span> : null}
        <Motion.Text
          value={renderValue(value)}
          hoverValue={hoverValue == null ? undefined : renderValue(hoverValue)}
          hovered={hovered}
          wrap={wrap && hovered}
        />
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
