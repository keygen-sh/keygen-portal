import { useEffect, useRef, useState } from "react"

import { Copy, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverAnchor,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import {
  formatUtcTimestamp,
  formatRelativeTime,
  type ZonedTimestamp,
  formatLocalTimestamp,
  formatPreciseRelative,
} from "@/lib/timestamps"
import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/lib/clipboard"

import { useMobile } from "@/hooks/use-mobile"

const CLOSE_DELAY_MS = 50
const OPEN_DELAY_MS = 30

interface TimestampProps {
  value: string | null | undefined
  display?: "relative" | "raw"
  precise?: boolean
  hint?: boolean
  emptyLabel?: string
  className?: string
}

export default function Timestamp({
  value,
  display = "relative",
  precise = false,
  hint = false,
  emptyLabel = "Not set",
  className,
}: TimestampProps) {
  const isMobile = useMobile()
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

  if (value == null || value === "") {
    return (
      <span className={cn("text-content-muted", className)}>{emptyLabel}</span>
    )
  }

  const label =
    display === "raw"
      ? value
      : precise
        ? formatPreciseRelative(value)
        : formatRelativeTime(value)

  const Anchor = isMobile ? PopoverTrigger : PopoverAnchor

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Anchor asChild>
        <span
          data-hovered={(hint && open) || undefined}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onClick={isMobile ? (event) => event.stopPropagation() : undefined}
          className={cn(
            "group/timestamp",
            display === "raw"
              ? "font-mono text-xs text-content-normal"
              : "text-content-muted",
            className,
          )}
        >
          {label}
          {hint && (
            <span className="mb-0.25 inline-flex w-0 shrink-0 align-middle transition-[width,margin] duration-200 group-hover/timestamp:ml-1.5 group-hover/timestamp:w-3 group-data-[hovered=true]/timestamp:ml-1.5 group-data-[hovered=true]/timestamp:w-3">
              <Info className="inline size-3 translate-x-2 self-center text-content-subdued opacity-0 transition-all duration-200 group-hover/timestamp:translate-x-0 group-hover/timestamp:opacity-100 group-data-[hovered=true]/timestamp:translate-x-0 group-data-[hovered=true]/timestamp:opacity-100" />
            </span>
          )}
        </span>
      </Anchor>
      <PopoverContent
        align={isMobile ? "center" : "start"}
        side={isMobile ? "bottom" : "left"}
        onMouseEnter={clearTimers}
        onMouseLeave={scheduleClose}
        onClick={(event) => event.stopPropagation()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn("w-80 p-3", isMobile && "mr-2")}
      >
        <TimestampPopover value={value} />
      </PopoverContent>
    </Popover>
  )
}

function ZonedRow({ zoned }: { zoned: ZonedTimestamp }) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="shrink-0 rounded-sm bg-background-3 font-mono"
      >
        {zoned.label}
      </Badge>
      <span className="min-w-0 flex-1 truncate text-content-muted">
        {zoned.date}
      </span>
      <span className="shrink-0 font-mono text-content-normal">
        {zoned.time}
      </span>
    </div>
  )
}

export function TimestampPopover({
  value,
  tooltip,
}: {
  value: string
  tooltip?: React.ReactNode
}) {
  return (
    <div className="flex flex-col text-xs">
      {tooltip && (
        <>
          <p className="text-pretty text-content-loud">{tooltip}</p>
          <Separator className="my-2.5" />
        </>
      )}
      <div className="flex items-center justify-between">
        <span className="min-w-0 flex-1 truncate font-mono text-content-muted">
          {value}
        </span>
        <Button
          variant="ghost"
          size="icon"
          title="Copy UTC timestamp"
          onClick={async (e) => {
            e.stopPropagation() // prevent click from propagating, e.g. selecting a table row
            await copyToClipboard(value)
          }}
          className="-my-1 -mr-1 size-6 shrink-0"
        >
          <Copy className="size-3.5" />
        </Button>
      </div>
      <span className="min-w-0 truncate text-content-normal">
        {formatPreciseRelative(value)}
      </span>
      <div className="mt-2 space-y-2">
        <ZonedRow zoned={formatUtcTimestamp(value)} />
        <ZonedRow zoned={formatLocalTimestamp(value)} />
      </div>
    </div>
  )
}

// convenience wrapper for table cells to make the popover easier to hover
export function TimestampCell({
  className,
  precise = false,
  ...props
}: TimestampProps) {
  return (
    <Timestamp
      {...props}
      precise={precise}
      className={cn("-m-2 block p-2", className)}
    />
  )
}
