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
import { ScrollArea } from "@/components/ui/scroll-area"
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

import { cn, deepEqual } from "@/lib/utils"
import { TableColumns, TableResource } from "@/lib/tables"

import EmptyCell from "@/components/tables/empty-cell"

import { useMobile } from "@/hooks/use-mobile"
import { PaginationState } from "@/hooks/use-pagination"

import * as Motion from "@/components/motion"
import * as Skeletons from "@/components/skeletons"

type DataTableProps<T extends TableResource> = {
  data: T[]
  pagination: PaginationState
  columns: TableColumns<T>
  onRowClick?: (row: T) => void
  staticColumns?: number
  isLoading?: boolean
  className?: string
}

export default function DataTable<T extends TableResource>({
  data,
  pagination,
  columns,
  onRowClick,
  staticColumns = 1,
  isLoading = false,
  className,
}: DataTableProps<T>): React.ReactElement {
  const isMobile = useMobile()

  const [sorting, setSorting] = useState<SortingState>([])

  // Horizontal scroll state
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const scrollTargetRef = useRef<number | null>(null)

  // Track which pages have already animated so revisiting doesn't animate again
  const prevPageRef = useRef(pagination.page)
  const directionRef = useRef<1 | -1>(1)
  const animatedPagesRef = useRef(new Set<number>())

  if (pagination.page !== prevPageRef.current) {
    directionRef.current = pagination.page > prevPageRef.current ? 1 : -1
    animatedPagesRef.current.add(prevPageRef.current)
    prevPageRef.current = pagination.page

    // Reset horizontal scroll when changing pages
    scrollTargetRef.current = null
    setCanScrollLeft(false)
  }

  const shouldAnimate = !animatedPagesRef.current.has(pagination.page)

  const [columnWidths, setColumnWidths] = useState<number[]>([]) // Widths of each column for calculating scroll offsets
  const headerCellRefs = useRef<(HTMLTableCellElement | null)[]>([]) // For measuring rendered header cell widths to determine column widths

  const tableInstance = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize,
      },
    },
    defaultColumn: {
      cell: (info) => {
        const value = info.getValue()
        if (value == null || value === "") return <EmptyCell />

        return value as React.ReactNode
      },
    },
    manualPagination: true,
    pageCount: -1,
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

  // Read offset width from each header cell to get rendered widths
  const measureColumns = useCallback(() => {
    const widths = headerCellRefs.current
      .slice(0, tableColumns.length)
      .map((element) => element?.offsetWidth ?? 0)

    if (widths.length > 0 && widths.some((w) => w > 0)) {
      setColumnWidths((prev) => (deepEqual(prev, widths) ? prev : widths))
    }
  }, [tableColumns.length])

  const updateScrollState = useCallback(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    const maxOffset = scroller.scrollWidth - scroller.clientWidth
    setCanScrollLeft(scroller.scrollLeft > 1)
    setCanScrollRight(scroller.scrollLeft < maxOffset - 1)
  }, [])

  // Measure columns and scroll extent on initial render to determine if scroll buttons are needed
  useLayoutEffect(() => {
    measureColumns()
    updateScrollState()
  }, [
    data,
    isMobile,
    measureColumns,
    updateScrollState,
    tableColumns.length,
    clampedStaticColumns,
  ])

  // Measure on container or table resize (e.g. sidebar toggle, cells loading)
  useEffect(() => {
    const container = containerRef.current
    const table = tableRef.current

    function measure() {
      measureColumns()
      updateScrollState()
    }

    const observer = new ResizeObserver(measure)
    if (container) observer.observe(container)
    if (table) observer.observe(table)

    return () => {
      observer.disconnect()
    }
  }, [data, pagination.page, measureColumns, updateScrollState])

  function handleScroll() {
    const scroller = scrollRef.current
    if (
      scroller &&
      scrollTargetRef.current !== null &&
      Math.abs(scroller.scrollLeft - scrollTargetRef.current) < 1
    ) {
      scrollTargetRef.current = null
    }

    updateScrollState()
  }

  function getColumnScrollOffsets(): number[] {
    const cells = headerCellRefs.current.slice(
      clampedStaticColumns,
      tableColumns.length,
    )
    const origin = cells[0]?.offsetLeft ?? 0

    return cells.map((cell) => (cell?.offsetLeft ?? 0) - origin)
  }

  function scrollLeft() {
    const scroller = scrollRef.current
    if (!scroller) return

    const offset = scrollTargetRef.current ?? scroller.scrollLeft
    const target = getColumnScrollOffsets().findLast((o) => o < offset - 1)

    scrollTargetRef.current = target ?? 0
    scroller.scrollTo({ left: scrollTargetRef.current, behavior: "smooth" })
  }

  function scrollRight() {
    const scroller = scrollRef.current
    if (!scroller) return

    const maxOffset = scroller.scrollWidth - scroller.clientWidth
    const offset = scrollTargetRef.current ?? scroller.scrollLeft
    const target = getColumnScrollOffsets().find((o) => o > offset + 1)

    scrollTargetRef.current = Math.min(target ?? maxOffset, maxOffset)
    scroller.scrollTo({ left: scrollTargetRef.current, behavior: "smooth" })
  }

  function getCellStyle(columnIndex: number): React.CSSProperties | undefined {
    // Render static columns above scrollable so they don't get visually cut off when scrolling
    if (columnIndex < clampedStaticColumns) {
      return {
        position: "sticky",
        left: columnOffsets[columnIndex],
        zIndex: clampedStaticColumns - columnIndex + 1,
      }
    }

    return undefined
  }

  return (
    <div
      className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col", className)}
    >
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
            className="relative h-full overflow-hidden"
            style={{ contain: "inline-size" }}
          >
            <ScrollArea
              key={pagination.page}
              orientation="both"
              className="h-full"
              viewportProps={{
                ref: scrollRef,
                className: "overscroll-x-contain",
                onScroll: handleScroll,
                onScrollEnd: () => {
                  scrollTargetRef.current = null
                },
              }}
            >
              <table
                ref={tableRef}
                className="min-w-full border-separate border-spacing-0 text-sm"
              >
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
                                "after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-12 after:bg-gradient-to-r after:from-background/50 after:to-transparent after:transition-opacity after:duration-300 after:md:w-24",
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
                                    <ChevronUp className="size-4 text-primary md:size-3" />
                                  ) : (
                                    <ChevronDown className="size-4 text-primary md:size-3" />
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
                                    onClick={scrollLeft}
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={!canScrollRight}
                                    onClick={scrollRight}
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
                              "border-b-0 transition-opacity duration-500 starting:opacity-0",
                            onRowClick ? "cursor-pointer" : "cursor-auto",
                          )}
                          style={
                            shouldAnimate
                              ? { transitionDelay: `${index * 30}ms` }
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
                                  "after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-12 after:bg-gradient-to-r after:from-background/50 after:to-transparent after:transition-opacity after:duration-300 after:md:w-24",
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
            </ScrollArea>

            {/* Gradient hint */}
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background/50 to-transparent transition-opacity duration-300 md:w-24",
                canScrollRight ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        </Motion.Slide>
      </div>
    </div>
  )
}
