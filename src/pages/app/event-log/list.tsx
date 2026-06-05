import { useCallback, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useEdition } from "@/hooks/use-edition"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { useCursorFollowTooltip } from "@/hooks/use-cursor-follow-tooltip"
import { useEventLogTableColumns } from "@/hooks/use-event-log-table-columns"

import { type EventLog } from "@/types/event-logs"

import { useListEventLogs, type EventLogFilters } from "@/queries/event-logs"

import { cn } from "@/lib/utils"

import * as keygen from "@/keygen"
import * as EventLogs from "@/components/event-logs"
import {
  type EventLogPreview,
  EventLogPreviewContent,
  type EventLogPreviewHandlers,
} from "@/components/event-logs/preview"
import DataTable from "@/components/data-table"
import PageFooter from "@/components/page-footer"
import PageHeader from "@/components/page-header"
import Pagination from "@/components/pagination"
import CursorTooltip from "@/components/cursor-tooltip"

const EVENT_LOG_SKELETON_COLUMNS = [
  "Timestamp",
  "Event",
  "Resource",
  "Actor",
  "Request",
] as const

const EVENT_LOG_SKELETON_ROWS = [
  ["w-44", "w-52", "w-28", "w-28", "w-28"],
  ["w-40", "w-64", "w-28", "w-20", "w-28"],
  ["w-44", "w-56", "w-20", "w-28", "w-28"],
  ["w-36", "w-48", "w-20", "w-20", "w-28"],
  ["w-36", "w-56", "w-28", "w-28", "w-28"],
  ["w-36", "w-48", "w-20", "w-20", "w-28"],
  ["w-40", "w-72", "w-28", "w-28", "w-28"],
  ["w-44", "w-56", "w-28", "w-28", "w-28"],
  ["w-44", "w-60", "w-28", "w-28", "w-28"],
  ["w-40", "w-72", "w-28", "w-28", "w-28"],
  ["w-44", "w-44", "w-28", "w-20", "w-28"],
  ["w-44", "w-60", "w-28", "w-28", "w-28"],
  ["w-36", "w-56", "w-28", "w-28", "w-28"],
  ["w-44", "w-64", "w-28", "w-28", "w-28"],
  ["w-36", "w-36", "w-28", "w-28", "w-28"],
  ["w-40", "w-52", "w-28", "w-20", "w-28"],
  ["w-44", "w-44", "w-28", "w-20", "w-28"],
  ["w-44", "w-64", "w-28", "w-28", "w-28"],
  ["w-36", "w-56", "w-28", "w-28", "w-28"],
  ["w-36", "w-48", "w-20", "w-20", "w-28"],
  ["w-40", "w-72", "w-28", "w-28", "w-28"],
  ["w-44", "w-56", "w-28", "w-28", "w-28"],
  ["w-40", "w-64", "w-28", "w-28", "w-28"],
  ["w-36", "w-56", "w-28", "w-28", "w-28"],
  ["w-44", "w-48", "w-28", "w-28", "w-28"],
  ["w-44", "w-60", "w-28", "w-28", "w-20"],
  ["w-44", "w-60", "w-28", "w-28", "w-28"],
  ["w-40", "w-52", "w-20", "w-20", "w-28"],
  ["w-44", "w-44", "w-28", "w-20", "w-28"],
  ["w-36", "w-48", "w-28", "w-28", "w-20"],
  ["w-36", "w-44", "w-20", "w-28", "w-20"],
  ["w-24", "w-36", "w-20", "w-28", "w-20"],
] as const

function StaticSkeleton({
  className,
}: {
  className?: string
}) {
  return <span className={className} />
}

function EventLogTableSkeleton() {
  return (
    <div className="relative min-w-full px-2">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <TableHeader>
          <TableRow>
            {EVENT_LOG_SKELETON_COLUMNS.map((column) => (
              <TableHead
                key={column}
                className="border-b border-accent bg-background text-sm select-none md:text-xs"
              >
                <div className="flex h-6 items-center px-1 text-xs text-content-muted">
                  {column}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {EVENT_LOG_SKELETON_ROWS.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="pointer-events-none">
              {row.map((width, columnIndex) => (
                <TableCell
                  key={columnIndex}
                  className="border-b border-accent bg-background"
                >
                  {columnIndex === 1 ? (
                    <StaticSkeleton
                      className={cn(
                        "block h-[14px] rounded-[3px] bg-secondary/20 animate-none",
                        width,
                      )}
                    />
                  ) : columnIndex === 0 ? (
                    <StaticSkeleton
                      className={cn("block h-3 rounded-sm bg-accent", width)}
                    />
                  ) : (
                    <StaticSkeleton
                      className={cn(
                        "block h-5 rounded-sm bg-content-subdued/30",
                        width,
                      )}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  )
}

export default function EventLogList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const navigate = useNavigate()
  const { isEE } = useEdition()

  const [filters, setFilters] = useFilterSearch<EventLogFilters>()
  const { cursor, reset, goToPage } = useCursors(page, setPage)
  const {
    active: preview,
    tooltipRef,
    currentPos,
    open: openPreview,
    move: movePreview,
    close: closePreview,
    closeNow: closePreviewNow,
  } = useCursorFollowTooltip<EventLogPreview>()

  const previewHandlers = useMemo<EventLogPreviewHandlers>(
    () => ({
      onOpenPreview: openPreview,
      onMovePreview: movePreview,
      onClosePreview: closePreview,
    }),
    [openPreview, movePreview, closePreview],
  )

  const handleFiltersChange = useCallback(
    (next: EventLogFilters) => {
      closePreviewNow()
      setFilters(next)
      reset()
    },
    [closePreviewNow, setFilters, reset],
  )

  const columns = useEventLogTableColumns(previewHandlers)

  const {
    data: eventLogs,
    links,
    isLoading,
    isFetching,
  } = useListEventLogs(
    {
      cursor,
      pageSize,
      filters,
    },
    { enabled: isEE },
  )

  const nextCursor = cursorFromLink(links?.next)
  const loading = isLoading || isFetching

  const handlePageChange = useCallback(
    (nextPage: number) => {
      closePreviewNow()
      goToPage(nextPage, nextCursor)
    },
    [closePreviewNow, goToPage, nextCursor],
  )

  const eventLogList = (
    <ScrollArea className="h-full overflow-auto">
      <DataTable<EventLog>
        data={eventLogs}
        table={table}
        columns={columns}
        pageCount={-1}
        isLoading={loading}
        onRowClick={(eventLog) =>
          navigate({
            to: "/$accountId/app/event-logs/$id",
            params: { accountId: keygen.config.id, id: eventLog.id },
          })
        }
      />
    </ScrollArea>
  )

  const content = (
    <>
      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <EventLogs.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {isEE ? (
          eventLogList
        ) : (
          <EventLogs.Upgrade className="h-full">
            <ScrollArea className="h-full overflow-auto">
              <EventLogTableSkeleton />
            </ScrollArea>
          </EventLogs.Upgrade>
        )}
      </div>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      </PageFooter>
    </>
  )

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Event Logs" />

      {content}

      <CursorTooltip
        open={!!preview}
        tooltipRef={tooltipRef}
        currentPos={currentPos}
        className="w-80"
      >
        {preview && <EventLogPreviewContent preview={preview} />}
      </CursorTooltip>
    </section>
  )
}
