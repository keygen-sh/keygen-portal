import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
} from "react"
import {
  flexRender,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"

import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react"

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
  staticColumns?: number
  pageCount: number
  isLoading?: boolean
  className?: string
}

export default function DataTable<T extends TableResource>({
  data,
  table,
  columns,
  onRowClick,
  staticColumns = 1,
  pageCount,
  isLoading = false,
  className,
}: DataTableProps<T>): React.ReactElement {
  const isMobile = useMobile()

  const [sorting, setSorting] = useState<SortingState>([])

  // Horizontal scroll state
  const [scrollIndex, setScrollIndex] = useState(0) // Which scrollable column we've scrolled past
  const [availableWidth, setAvailableWidth] = useState(0) // Determine if columns overflow and how much to scroll
  const containerRef = useRef<HTMLDivElement>(null) // For measuring available container width and observing resizes (e.g. sidebar toggle)

  // Track which pages have already animated so revisiting doesn't animate again
  const prevPageRef = useRef(table.page)
  const directionRef = useRef<1 | -1>(1)
  const animatedPagesRef = useRef(new Set<number>())

  if (table.page !== prevPageRef.current) {
    directionRef.current = table.page > prevPageRef.current ? 1 : -1
    animatedPagesRef.current.add(prevPageRef.current)
    prevPageRef.current = table.page

    // Reset horizontal scroll when changing pages
    setScrollIndex(0)
  }

  const shouldAnimate = !animatedPagesRef.current.has(table.page)

  const [columnWidths, setColumnWidths] = useState<number[]>([]) // Widths of each column for calculating scroll offsets
  const headerCellRefs = useRef<(HTMLTableCellElement | null)[]>([]) // For measuring rendered header cell widths to determine column widths

  const tableInstance = useReactTable({
    data,
    columns,
    state: {
      sorting,
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const effectiveStaticColumns = isMobile ? 1 : Math.max(1, staticColumns)
  const tableColumns = tableInstance.getVisibleFlatColumns()
  const clampedStaticColumns = Math.min(
    effectiveStaticColumns,
    tableColumns.length,
  )

  // Column positions used to calculate how far to shift when scrolling
  const columnOffsets = useMemo(() => {
    const offsets = [0]
    for (let i = 0; i < columnWidths.length; i++) {
      offsets.push(offsets[i] + columnWidths[i])
    }
    return offsets
  }, [columnWidths])
  const totalColumnsWidth = columnOffsets[columnWidths.length] ?? 0

  // FIXME(cazden) Remove the +2 hack
  const allColumnsVisible =
    columnWidths.length === 0 || availableWidth + 2 >= totalColumnsWidth

  const maxScrollOffset = Math.max(0, totalColumnsWidth - availableWidth)
  const unclampedScrollOffset =
    columnWidths.length > 0
      ? (columnOffsets[clampedStaticColumns + scrollIndex] ??
          columnOffsets[columnWidths.length] ??
          0) - (columnOffsets[clampedStaticColumns] ?? 0)
      : 0
  const scrollOffset = Math.min(unclampedScrollOffset, maxScrollOffset)

  const scrollableColumnCount = tableColumns.length - clampedStaticColumns

  const canScrollLeft = scrollIndex > 0
  const canScrollRight = !allColumnsVisible && scrollOffset < maxScrollOffset

  // Read offset width from each header cell to get rendered widths
  const measureColumns = useCallback(() => {
    const widths = headerCellRefs.current
      .slice(0, tableColumns.length)
      .map((element) => element?.offsetWidth ?? 0)

    if (widths.length > 0 && widths.some((w) => w > 0)) {
      setColumnWidths(widths)
    }
  }, [tableColumns.length])

  // Measure columns and container width on initial render to determine if scroll buttons are needed and how much to scroll
  useLayoutEffect(() => {
    measureColumns()

    const container = containerRef.current
    if (container) {
      setAvailableWidth(container.getBoundingClientRect().width)
    }
  }, [
    data,
    isMobile,
    measureColumns,
    tableColumns.length,
    clampedStaticColumns,
  ])

  // Measure on container resize (e.g. sidebar toggle)
  useEffect(() => {
    const container = containerRef.current

    function measure() {
      if (container) {
        setAvailableWidth(container.getBoundingClientRect().width)
      }

      measureColumns()
    }

    const observer = new ResizeObserver(measure)
    if (container) observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [data, table.page, measureColumns])

  function getCellStyle(columnIndex: number): React.CSSProperties {
    // Render static columns above scrollable so they don't get visually cut off when scrolling
    if (columnIndex < clampedStaticColumns) {
      return {
        position: "relative",
        zIndex: clampedStaticColumns - columnIndex + 1,
      }
    }

    // Shift scrollable columns left
    return {
      transform: `translateX(-${scrollOffset}px)`,
      transition: "transform 300ms ease",
    }
  }

  return (
    <div className={cn("relative flex min-w-0 flex-1 flex-col", className)}>
      <Skeletons.Table
        className={cn(
          !isLoading && "absolute opacity-0 transition-opacity duration-500",
        )}
      />

      <div
        className={cn(
          isLoading
            ? "absolute opacity-0"
            : "flex min-h-0 min-w-0 flex-1 flex-col opacity-100 transition-opacity duration-200",
        )}
      >
        <Motion.Slide
          direction={directionRef.current}
          className="min-h-0 min-w-0 flex-1 px-2"
        >
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ contain: "inline-size" }}
          >
            <div key={table.page} className="relative w-full">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <TableHeader>
                  {tableInstance.getHeaderGroups().map((group) => (
                    <TableRow key={group.id}>
                      {group.headers.map((header, columnIndex) => {
                        const canSort = header.column.getCanSort()
                        const direction = header.column.getIsSorted()

                        return (
                          <TableHead
                            key={header.id}
                            ref={(element) => {
                              headerCellRefs.current[columnIndex] = element
                            }}
                            className={cn(
                              "cursor-auto border-b border-accent bg-background text-sm select-none md:text-xs",
                              columnIndex < group.headers.length - 1 &&
                                "border-r",
                              columnIndex === clampedStaticColumns - 1 &&
                                "after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-6 after:bg-gradient-to-r after:from-secondary/5 after:to-transparent after:transition-opacity after:duration-300 after:md:w-24",
                              columnIndex === clampedStaticColumns - 1 &&
                                (canScrollLeft
                                  ? "after:opacity-100"
                                  : "after:opacity-0"),
                            )}
                            style={getCellStyle(columnIndex)}
                          >
                            <div className="flex items-center gap-2">
                              {/* Sort button */}
                              <Button
                                variant="ghost"
                                className={cn(
                                  "flex h-6 items-center gap-2 rounded-sm px-1! text-xs",
                                  canSort && "cursor-pointer",
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                              >
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
                              </Button>

                              {/* Scroll buttons */}
                              {columnIndex === clampedStaticColumns - 1 && (
                                <div
                                  className="ml-auto flex items-center gap-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={!canScrollLeft}
                                    onClick={() =>
                                      setScrollIndex((i) => Math.max(i - 1, 0))
                                    }
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={!canScrollRight}
                                    onClick={() =>
                                      setScrollIndex((i) =>
                                        Math.min(i + 1, scrollableColumnCount),
                                      )
                                    }
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody className="text-base md:text-sm">
                  {tableInstance.getRowModel().rows.length ? (
                    tableInstance.getRowModel().rows.map((row, index) => {
                      const cells = row.getVisibleCells()
                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => onRowClick?.(row.original)}
                          className={cn(
                            "group/row",
                            shouldAnimate &&
                              "border-b-0 animate-in [animation-duration:500ms] fade-in fill-mode-backwards",
                            onRowClick ? "cursor-pointer" : "cursor-auto",
                          )}
                          style={
                            shouldAnimate
                              ? { animationDelay: `${index * 30}ms` }
                              : undefined
                          }
                        >
                          {cells.map((cell, columnIndex) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                "border-b border-accent bg-background",
                                onRowClick && "group-hover/row:bg-accent",
                                columnIndex < cells.length - 1 && "border-r",
                                columnIndex === clampedStaticColumns - 1 &&
                                  "after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-6 after:bg-gradient-to-r after:from-secondary/5 after:to-transparent after:transition-opacity after:duration-300 after:md:w-24",
                                columnIndex === clampedStaticColumns - 1 &&
                                  (canScrollLeft
                                    ? "after:opacity-100"
                                    : "after:opacity-0"),
                              )}
                              style={getCellStyle(columnIndex)}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow className="pointer-events-none">
                      <TableCell
                        colSpan={tableColumns.length}
                        className="h-24 text-center text-content-subdued"
                      >
                        Nothing here yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>

            {/* Gradient hint */}
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-secondary/5 to-transparent transition-opacity duration-300 md:w-24",
                canScrollRight ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        </Motion.Slide>
      </div>
    </div>
  )
}
