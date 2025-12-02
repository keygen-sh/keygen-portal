import React, { useEffect, useState } from "react"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"

export type DataTableProps<T, TValue = string> = {
  data: T[]
  columns: ColumnDef<T, TValue>[]
  onRowClick?: (row: T) => void
  hideOnMobile?: string[]
  pageSize?: number
  includePagination?: boolean
}

export default function DataTable<T, TValue = string>({
  data,
  columns,
  onRowClick,
  hideOnMobile = [],
  pageSize = 10,
  includePagination = true,
}: DataTableProps<T, TValue>): React.ReactElement {
  const isMobile = useMobile()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({})

  useEffect(() => {
    const next: Record<string, boolean> = {}
    hideOnMobile.forEach((k) => (next[String(k)] = !isMobile))
    setColumnVisibility(next)
  }, [isMobile, hideOnMobile])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  return (
    <div className="px-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="pointer-events-none">
              <TableCell
                colSpan={table.getVisibleFlatColumns().length}
                className="h-24 text-center text-content-subdued"
              >
                Nothing here yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {includePagination && table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-end space-x-4 p-4">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
