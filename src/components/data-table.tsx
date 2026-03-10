import { useState, useEffect, useRef, useLayoutEffect } from "react"
import {
  flexRender,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { TableColumns, TableResource } from "@/lib/tables"

import { useMobile } from "@/hooks/use-mobile"
import { DataTableState } from "@/hooks/use-data-table"

import * as Motion from "@/components/motion"
import * as Skeletons from "@/components/skeletons"

type DataTableProps<T extends TableResource> = {
  data: T[]
  table: DataTableState
  columns: TableColumns<T>
  onRowClick?: (row: T) => void
  hideOnMobile?: string[]
  pageCount: number
  isLoading?: boolean
  className?: string
}

export default function DataTable<T extends TableResource>({
  data,
  table,
  columns,
  onRowClick,
  hideOnMobile = [],
  pageCount,
  isLoading = false,
  className,
}: DataTableProps<T>): React.ReactElement {
  const isMobile = useMobile()

  const headerRef = useRef<HTMLTableSectionElement>(null)
  const firstRowRef = useRef<HTMLTableRowElement>(null)
  const lastMeasurementRef = useRef({ rowHeight: 0, headerHeight: 0 })

  // Update page size based on available height so table fills container
  useLayoutEffect(() => {
    if (!table.onMeasure) return

    const row = firstRowRef.current
    if (!row) return

    let rowHeight = row.offsetHeight

    // TODO(cazden) Refactor this garbage; adds compensation for header border so height is accurate when only initial row is available
    if (data.length === 1 && headerRef.current?.firstElementChild) {
      const headerRow = headerRef.current.firstElementChild as HTMLElement
      rowHeight +=
        parseFloat(getComputedStyle(headerRow).borderBottomWidth) || 0
    }

    const headerHeight = headerRef.current?.offsetHeight ?? 0

    // Skip if no changes
    if (
      lastMeasurementRef.current.rowHeight === rowHeight &&
      lastMeasurementRef.current.headerHeight === headerHeight
    )
      return

    lastMeasurementRef.current = { rowHeight, headerHeight }
    table.onMeasure({ rowHeight, headerHeight })
  }, [isLoading, data.length, isMobile, table])

  // Track which pages have already animated so revisiting doesn't animate again
  const prevPageRef = useRef(table.page)
  const directionRef = useRef<1 | -1>(1)
  const animatedPagesRef = useRef(new Set<number>())

  if (table.page !== prevPageRef.current) {
    directionRef.current = table.page > prevPageRef.current ? 1 : -1
    animatedPagesRef.current.add(prevPageRef.current)
    prevPageRef.current = table.page
  }

  const shouldAnimate = !animatedPagesRef.current.has(table.page)

  // TODO(cazden) Refactor this with horizontal scroll (#47)
  // Column visibility
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({})

  // Toggle column visibility based on mobile breakpoint
  useEffect(() => {
    const next: Record<string, boolean> = {}
    hideOnMobile.forEach((k) => (next[String(k)] = !isMobile))
    setColumnVisibility(next)
  }, [isMobile, hideOnMobile])

  const tableInstance = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex: table.page - 1, pageSize: table.pageSize },
    },
    manualPagination: true,
    pageCount,
    onPaginationChange: (updater) => {
      const current = {
        pageIndex: table.page - 1,
        pageSize: table.pageSize,
      }
      const next = typeof updater === "function" ? updater(current) : updater
      table.setPage(next.pageIndex + 1)
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: table.pageSize } },
  })

  return (
    <div
      ref={table.containerRef}
      className={cn("relative flex flex-1 flex-col", className)}
    >
      <Skeletons.Table
        className={cn(
          !isLoading && "absolute opacity-0 transition-opacity duration-500",
        )}
      />

      {/* FIXME(cazden) isMeasured never converges if data.length is 0 from API response, so this div remains hidden.
      e.g. processes table doesn't transition unless we spawn a process. Need to make sure isMeasured always converges. */}
      <div
        className={cn(
          isLoading || !table.isMeasured
            ? "absolute opacity-0"
            : "flex min-h-0 flex-1 flex-col opacity-100 transition-opacity delay-50 duration-200",
        )}
      >
        <Motion.Slide
          direction={directionRef.current}
          className="min-h-0 flex-1 px-4"
        >
          <Table key={table.page}>
            <TableHeader ref={headerRef}>
              {tableInstance.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const direction = header.column.getIsSorted()

                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="text-sm select-none md:text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort &&
                            (!direction ? (
                              <ChevronsUpDown className="size-4 md:size-3" />
                            ) : direction === "asc" ? (
                              <ChevronUp className="size-4 text-brand-primary md:size-3" />
                            ) : (
                              <ChevronDown className="size-4 text-brand-primary md:size-3" />
                            ))}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="text-base md:text-sm">
              {tableInstance.getRowModel().rows.length ? (
                tableInstance.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    ref={index === 0 ? firstRowRef : undefined}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      shouldAnimate &&
                        "animate-in [animation-duration:500ms] fade-in fill-mode-backwards",
                      onRowClick && "cursor-pointer",
                    )}
                    style={
                      shouldAnimate
                        ? { animationDelay: `${index * 30}ms` }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="pointer-events-none">
                  <TableCell
                    colSpan={tableInstance.getVisibleFlatColumns().length}
                    className="h-24 text-center text-content-subdued"
                  >
                    Nothing here yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Motion.Slide>
      </div>
    </div>
  )
}
