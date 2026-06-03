import { useCallback, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"

import { ScrollArea } from "@/components/ui/scroll-area"

import { EventLogMockData } from "@/mock/event-logs"

import {
  cursorFromLink,
  useEventLogCursors,
} from "@/hooks/use-event-log-cursors"
import { useEdition } from "@/hooks/use-edition"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { useCursorFollowTooltip } from "@/hooks/use-cursor-follow-tooltip"
import { useEventLogTableColumns } from "@/hooks/use-event-log-table-columns"

import { type EventLog } from "@/types/event-logs"

import { useListEventLogs, type EventLogFilters } from "@/queries/event-logs"

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

export default function EventLogList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const navigate = useNavigate()
  const { isEE } = useEdition()

  const [filters, setFilters] = useFilterSearch<EventLogFilters>()
  const { cursor, reset, goToPage } = useEventLogCursors(page, setPage)
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

  const content = (
    <>
      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <EventLogs.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {" "}
        <ScrollArea className="h-full overflow-auto">
          <DataTable<EventLog>
            data={isEE ? eventLogs : EventLogMockData}
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

      {isEE ? (
        content
      ) : (
        <EventLogs.Upgrade className="min-h-0 flex-1">
          {content}
        </EventLogs.Upgrade>
      )}

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
