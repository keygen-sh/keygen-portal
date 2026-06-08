import { useCallback, useMemo } from "react"

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
import { useRequestLogTableColumns } from "@/hooks/use-request-log-table-columns"

import { type RequestLog } from "@/types/request-logs"

import {
  useListRequestLogs,
  type RequestLogFilters,
} from "@/queries/request-logs"

import { cn } from "@/lib/utils"

import * as RequestLogs from "@/components/request-logs"
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

const REQUEST_LOG_SKELETON_COLUMNS = [
  "Timestamp",
  "IP",
  "Status",
  "Method",
  "URL",
] as const

const REQUEST_LOG_SKELETON_ROWS = [
  ["w-44", "w-28", "w-10", "w-14", "w-64"],
  ["w-40", "w-32", "w-10", "w-16", "w-72"],
  ["w-44", "w-24", "w-10", "w-14", "w-56"],
  ["w-36", "w-28", "w-10", "w-16", "w-48"],
  ["w-44", "w-32", "w-10", "w-14", "w-64"],
  ["w-40", "w-24", "w-10", "w-12", "w-52"],
  ["w-44", "w-28", "w-10", "w-16", "w-72"],
  ["w-36", "w-32", "w-10", "w-14", "w-56"],
  ["w-44", "w-24", "w-10", "w-16", "w-60"],
  ["w-40", "w-28", "w-10", "w-12", "w-72"],
  ["w-44", "w-32", "w-10", "w-14", "w-44"],
  ["w-36", "w-24", "w-10", "w-16", "w-64"],
  ["w-44", "w-28", "w-10", "w-14", "w-56"],
  ["w-40", "w-32", "w-10", "w-16", "w-72"],
  ["w-36", "w-24", "w-10", "w-12", "w-48"],
  ["w-44", "w-28", "w-10", "w-14", "w-60"],
  ["w-40", "w-32", "w-10", "w-16", "w-52"],
  ["w-44", "w-24", "w-10", "w-14", "w-72"],
  ["w-36", "w-28", "w-10", "w-16", "w-56"],
  ["w-40", "w-32", "w-10", "w-12", "w-48"],
  ["w-44", "w-24", "w-10", "w-14", "w-72"],
  ["w-36", "w-28", "w-10", "w-16", "w-64"],
  ["w-44", "w-32", "w-10", "w-14", "w-56"],
  ["w-40", "w-24", "w-10", "w-16", "w-60"],
  ["w-36", "w-28", "w-10", "w-12", "w-48"],
  ["w-44", "w-32", "w-10", "w-14", "w-72"],
  ["w-40", "w-24", "w-10", "w-16", "w-52"],
  ["w-36", "w-28", "w-10", "w-14", "w-44"],
] as const

function StaticSkeleton({ className }: { className?: string }) {
  return <span className={className} />
}

function RequestLogTableSkeleton() {
  return (
    <div className="relative min-w-full px-2">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <TableHeader>
          <TableRow>
            {REQUEST_LOG_SKELETON_COLUMNS.map((column) => (
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
          {REQUEST_LOG_SKELETON_ROWS.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="pointer-events-none">
              {row.map((width, columnIndex) => (
                <TableCell
                  key={columnIndex}
                  className="border-b border-accent bg-background"
                >
                  {columnIndex === 4 ? (
                    <StaticSkeleton
                      className={cn(
                        "block h-[14px] animate-none rounded-[3px] bg-secondary/20",
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
              <RequestLogTableSkeleton />
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
