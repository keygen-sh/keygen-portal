import React, { useState, useRef, useEffect } from "react"

import { Badge, type BadgeVariant } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { Info } from "lucide-react"

import { cn, splitLastWord } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"

const OPEN_DELAY_MS = 50
const CLOSE_DELAY_MS = 30

type TooltipBadgeProps<T> = {
  value: T
  hoverValue?: T
  icon?: React.ReactNode
  tooltip?: string
  content?: React.ReactNode
  contentClassName?: string
  interactive?: boolean
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
  content,
  contentClassName,
  interactive = false,
  suffix,
  wrap = false,
  variant,
  className,
}: TooltipBadgeProps<T>) {
  const isMobile = useMobile()
  const [hovered, setHovered] = useState(false)
  const displayValue = hovered && hoverValue != null ? hoverValue : value
  const hoverInteractive = interactive && !isMobile
  const [open, setOpen] = useState(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current)
      openTimer.current = null
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleOpen = () => {
    clearTimers()
    openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS)
  }
  const scheduleClose = () => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(() => clearTimers, [])

  const tooltipSpace = (
    <span className="hidden [word-spacing:0.25em] group-hover/tooltip-badge:inline group-data-[hovered=true]/tooltip-badge:inline">
      {" "}
    </span>
  )

  const tooltipIcon = (
    <span className="pointer-events-none inline-flex w-0 transition-[width] duration-200 ease-out group-hover/tooltip-badge:w-3 group-data-[hovered=true]/tooltip-badge:w-3">
      <Info
        aria-hidden
        className="size-3 shrink-0 translate-x-3 opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover/tooltip-badge:translate-x-0 group-hover/tooltip-badge:opacity-100 group-data-[hovered=true]/tooltip-badge:translate-x-0 group-data-[hovered=true]/tooltip-badge:opacity-100"
      />
    </span>
  )

  const suffixSlot = suffix ? (
    <span className="inline-flex align-middle [&_[data-slot=badge]]:ml-0">
      {suffix}
    </span>
  ) : null

  const renderValue = (displayValue: T) => {
    if (!wrap) return String(displayValue)

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
        data-hovered={hovered || open || undefined}
        onMouseEnter={() => {
          setHovered(true)
          if (hoverInteractive) scheduleOpen()
        }}
        onMouseLeave={() => {
          setHovered(false)
          if (hoverInteractive) scheduleClose()
        }}
      >
        {icon ? <span className="size-3">{icon}</span> : null}
        <span
          className={cn(
            "inline-flex cursor-default align-middle select-text",
            wrap && hovered ? "min-w-0 overflow-visible" : "overflow-hidden",
          )}
        >
          <span
            className={cn(
              "items-center",
              wrap && hovered
                ? "inline min-w-0 whitespace-normal"
                : "inline whitespace-nowrap",
            )}
          >
            {renderValue(displayValue)}
          </span>
        </span>
        {!wrap && tooltipSpace}
        {!wrap && tooltipIcon}
        {!wrap && suffixSlot && <> {suffixSlot}</>}
      </span>
    </Badge>
  )

  const body = content ?? tooltip

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>{badge}</PopoverTrigger>
        <PopoverContent
          className={cn(
            "mr-2 max-w-72 bg-accent text-pretty text-content-loud",
            contentClassName,
          )}
        >
          {body}
        </PopoverContent>
      </Popover>
    )
  }

  if (interactive) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>{badge}</PopoverAnchor>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={8}
          onMouseEnter={clearTimers}
          onMouseLeave={scheduleClose}
          onClick={(event) => event.stopPropagation()}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(contentClassName)}
        >
          {body}
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
        className={cn(
          "pointer-events-none max-w-72 bg-accent text-pretty text-content-loud",
          contentClassName,
        )}
      >
        {body}
      </TooltipContent>
    </Tooltip>
  )
}
