import { useState, useEffect, useMemo, useRef } from "react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { ChevronRight, GitCommitHorizontal } from "lucide-react"

import { EventLogMockData } from "@/mock/event-logs"

import { useEdition } from "@/hooks/use-edition"
import {
  cursorFromLink,
  useEventLogCursors,
} from "@/hooks/use-event-log-cursors"
import { useMobile } from "@/hooks/use-mobile"
import { usePermissions } from "@/hooks/use-permissions"

import { type EventLog, type EventLogFilters } from "@/types/event-logs"

import { useListEventLogs } from "@/queries/event-logs"

import {
  metadataDiffEntries,
  formatEventLogTimestamp,
  formatEventLogRelativeTime,
} from "@/lib/event-logs"
import { cn } from "@/lib/utils"

import * as keygen from "@/keygen"
import * as Motion from "@/components/motion"
import Pagination from "@/components/pagination"
import GoToButton from "@/components/go-to-button"
import ResourceLink from "@/components/resource-link"
import EventLogsUpgrade from "@/components/event-logs/upgrade"

interface EventLogFeedProps {
  filters?: EventLogFilters
  pageSize?: number
  compact?: boolean
  className?: string
}

function EventLogLinkRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs text-content-muted">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function EventLogRow({
  eventLog,
  isFirst,
  isLast,
}: {
  eventLog: EventLog
  isFirst: boolean
  isLast: boolean
}) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((current) => !current)

  const { event, metadata, created } = eventLog.attributes
  const whodunnit = eventLog.relationships.whodunnit?.data
  const request = eventLog.relationships.request?.data
  const timestamp = formatEventLogTimestamp(created)
  const changes = metadataDiffEntries(metadata).length

  return (
    <article
      onClick={toggle}
      className="group/event-log flex cursor-pointer gap-3 bg-background px-4 text-xs transition-colors hover:bg-background-2"
    >
      <div className="flex shrink-0 flex-col items-center">
        {!isFirst && <span className="h-3 w-px bg-accent" />}
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full bg-background-3 text-content-muted",
            isFirst && "mt-3",
          )}
        >
          <GitCommitHorizontal className="size-3" />
        </span>
        {!isLast && <span className="w-px flex-1 bg-accent" />}
      </div>

      <div className="min-w-0 flex-1 py-3">
        <div className="flex min-w-0 items-center">
          <Badge variant="secondary" className="max-w-full truncate font-mono">
            {event}
          </Badge>
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs">
          <span className="shrink-0 text-content-muted" title={timestamp}>
            {formatEventLogRelativeTime(created)}
          </span>
          <span className="min-w-0 truncate text-content-normal">
            {changes === 0
              ? "No changes"
              : `${changes} ${changes === 1 ? "change" : "changes"}`}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            className={cn(
              "ml-auto flex size-5 shrink-0 items-center justify-center rounded-sm text-content-muted group-hover/event-log:opacity-100 hover:text-content-normal focus-visible:opacity-100",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-200",
                open && "rotate-90",
              )}
            />
          </button>
        </div>

        {open && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 cursor-default space-y-0.5 text-xs"
          >
            <EventLogLinkRow label="Actor">
              <ResourceLink
                linkage={whodunnit}
                emptyLabel="System"
                buttonClassName="text-xs"
              />
            </EventLogLinkRow>
            <EventLogLinkRow label="Request">
              <ResourceLink linkage={request} buttonClassName="text-xs" />
            </EventLogLinkRow>
            <EventLogLinkRow label="Details">
              <GoToButton
                path="/$accountId/app/event-logs/$id"
                params={{ accountId: keygen.config.id, id: eventLog.id }}
                label="View event log"
                buttonClassName="text-xs"
              />
            </EventLogLinkRow>
          </div>
        )}
      </div>
    </article>
  )
}

function EventLogSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="size-5 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-36 rounded-sm" />
        <Skeleton className="h-3 w-20 rounded-sm" />
      </div>
    </div>
  )
}

export default function EventLogFeed({
  filters,
  pageSize,
  compact = false,
  className,
}: EventLogFeedProps) {
  const isMobile = useMobile()
  const { can } = usePermissions()
  const { isEE } = useEdition()
  const [page, setPage] = useState(1)
  const { cursor, reset, goToPage } = useEventLogCursors(page, setPage)

  const resolvedPageSize = pageSize ?? (isMobile ? 10 : 12)

  const resetKey = useMemo(
    () => JSON.stringify({ filters, pageSize: resolvedPageSize }),
    [filters, resolvedPageSize],
  )

  useEffect(() => {
    reset()
  }, [resetKey, reset])

  const prevPageRef = useRef(page)
  const directionRef = useRef<1 | -1>(1)
  if (page !== prevPageRef.current) {
    directionRef.current = page > prevPageRef.current ? 1 : -1
    prevPageRef.current = page
  }

  const {
    data: eventLogs,
    links,
    isLoading,
    isFetching,
    isError,
    error,
  } = useListEventLogs(
    {
      cursor,
      pageSize: resolvedPageSize,
      filters,
    },
    { enabled: isEE && can("event-log.read") },
  )

  if (!isEE) {
    const mockRows = EventLogMockData.slice(0, resolvedPageSize)

    return (
      <EventLogsUpgrade className={cn("min-h-0 flex-1", className)}>
        {mockRows.map((eventLog, index) => (
          <EventLogRow
            key={eventLog.id}
            eventLog={eventLog}
            isFirst={index === 0}
            isLast={index === mockRows.length - 1}
          />
        ))}
      </EventLogsUpgrade>
    )
  }

  if (!can("event-log.read")) {
    return (
      <div className="p-4 text-xs text-content-subdued">
        You do not have permission to view event logs.
      </div>
    )
  }

  const nextCursor = cursorFromLink(links?.next)
  const loading = isLoading || isFetching
  const pageCount = Math.max(
    1,
    links?.meta?.pages ?? page + (nextCursor ? 1 : 0),
  )

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Motion.Slide direction={directionRef.current}>
          <div key={page}>
            {loading && eventLogs.length === 0 ? (
              Array.from({ length: compact ? 4 : 8 }).map((_, index) => (
                <EventLogSkeleton key={index} />
              ))
            ) : isError ? (
              <div className="p-4 text-xs text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Failed to load logs."}
              </div>
            ) : eventLogs.length > 0 ? (
              eventLogs.map((eventLog, index) => (
                <EventLogRow
                  key={eventLog.id}
                  eventLog={eventLog}
                  isFirst={index === 0}
                  isLast={index === eventLogs.length - 1}
                />
              ))
            ) : (
              <div className="p-4 text-xs text-content-subdued">
                Nothing here yet.
              </div>
            )}
          </div>
        </Motion.Slide>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-accent bg-background p-3">
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={loading}
        />
      </div>
    </div>
  )
}
