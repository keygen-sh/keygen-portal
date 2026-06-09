import { useCallback, useMemo } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useEdition } from "@/hooks/use-edition"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { useCursorFollowTooltip } from "@/hooks/use-cursor-follow-tooltip"
import { useRequestLogTableColumns } from "@/hooks/use-request-log-table-columns"

import { type RequestLog } from "@/types/request-logs"

import {
  useListRequestLogs,
  type RequestLogFilters,
} from "@/queries/request-logs"

import * as RequestLogs from "@/components/request-logs"
import * as Skeletons from "@/components/skeletons"
import {
  type RequestLogPreview,
  RequestLogPreviewContent,
  type RequestLogPreviewHandlers,
} from "@/components/request-logs/preview"
import DataTable from "@/components/data-table"
import PageFooter from "@/components/page-footer"
import PageHeader from "@/components/page-header"
import Pagination from "@/components/pagination"
import CursorTooltip from "@/components/cursor-tooltip"

export default function RequestLogList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { isEE } = useEdition()

  const [filters, setFilters] = useFilterSearch<RequestLogFilters>()
  const { cursor, reset, goToPage } = useCursors(page, setPage)
  const {
    active: preview,
    tooltipRef,
    currentPos,
    open: openPreview,
    move: movePreview,
    close: closePreview,
    closeNow: closePreviewNow,
  } = useCursorFollowTooltip<RequestLogPreview>()

  const previewHandlers = useMemo<RequestLogPreviewHandlers>(
    () => ({
      onOpenPreview: openPreview,
      onMovePreview: movePreview,
      onClosePreview: closePreview,
    }),
    [openPreview, movePreview, closePreview],
  )

  const handleFiltersChange = useCallback(
    (next: RequestLogFilters) => {
      closePreviewNow()
      setFilters(next)
      reset()
    },
    [closePreviewNow, setFilters, reset],
  )

  const columns = useRequestLogTableColumns(previewHandlers)

  const {
    data: requestLogs,
    links,
    isLoading,
    isFetching,
  } = useListRequestLogs(
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

  const requestLogList = (
    <ScrollArea className="h-full overflow-auto">
      <DataTable<RequestLog>
        data={requestLogs}
        table={table}
        columns={columns}
        isLoading={loading}
      />
    </ScrollArea>
  )

  const content = (
    <>
      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <RequestLogs.FilterBar
          filters={filters}
          onChange={handleFiltersChange}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {isEE ? (
          requestLogList
        ) : (
          <RequestLogs.Upgrade className="h-full">
            <ScrollArea className="h-full overflow-auto">
              <Skeletons.RequestLogs />
            </ScrollArea>
          </RequestLogs.Upgrade>
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
      <PageHeader title="Request Logs" />

      {content}

      <CursorTooltip
        open={!!preview}
        tooltipRef={tooltipRef}
        currentPos={currentPos}
        className="w-80"
      >
        {preview && <RequestLogPreviewContent preview={preview} />}
      </CursorTooltip>
    </section>
  )
}
