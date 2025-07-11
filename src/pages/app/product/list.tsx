import { useState, useEffect, useMemo } from "react"

import { useNavigate } from "@tanstack/react-router"
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"

import { Product, ProductsData } from "@/types/products"
import { useMobile } from "@/hooks/use-mobile"

import * as keygen from "@/keygen"
import * as Products from "@/components/products"
import PageHeader from "@/components/page-header"
import ClipboardButton from "@/components/clipboard-button"

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [pageSize] = useState(10)

  const isMobile = useMobile()
  const navigate = useNavigate()

  const column = createColumnHelper<Product>()
  const [columnVisibility, setColumnVisibility] = useState({})

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      column.accessor("id", {
        header: "ID",
        cell: (info) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <ClipboardButton value={info.getValue()} />
            </TooltipTrigger>

            <TooltipContent
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {info.getValue()}
            </TooltipContent>
          </Tooltip>
        ),
      }),
      column.accessor("name", {
        header: "Name",
      }),
      column.accessor("code", {
        header: "Code",
      }),
      column.accessor("url", {
        header: "URL",
        cell: (info) => (
          <a
            target="_blank"
            href={info.getValue()}
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {info.getValue()}
          </a>
        ),
      }),
      column.accessor("created", {
        header: "Created at",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        sortingFn: "datetime",
      }),
      column.accessor("updated", {
        header: "Updated at",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        sortingFn: "datetime",
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  useEffect(() => {
    setColumnVisibility({
      id: !isMobile,
      url: !isMobile,
      created: !isMobile,
      updated: !isMobile,
      name: true,
      code: true,
    })
  }, [isMobile])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        setTimeout(() => {
          setProducts(ProductsData ?? [])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error loading products:", error)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section>
      <PageHeader title="Products">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={loading}>
              Create Product
            </Button>
          </DialogTrigger>

          <Products.Create.Modal
            onSelectProduct={(product) => {
              if (product) {
                setProducts((prev) => [product, ...prev])
              }
            }}
            onChangeMode={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {products.length > 0 ? (
        <div className="px-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sortDir = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="text-sm md:text-xs"
                      >
                        <div className="flex items-center gap-2 transition-colors duration-200 hover:text-content-muted">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <>
                              {!sortDir && (
                                <ChevronsUpDown className="size-4 md:size-3" />
                              )}
                              {sortDir === "asc" && (
                                <ChevronUp className="size-4 text-brand-primary md:size-3" />
                              )}
                              {sortDir === "desc" && (
                                <ChevronDown className="size-4 text-brand-primary md:size-3" />
                              )}
                            </>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="text-base md:text-sm">
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    navigate({
                      to: "/$id/app/products/$productId",
                      params: {
                        id: keygen.config.id,
                        productId: row.original.id,
                      },
                    })
                  }}
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
              ))}
            </TableBody>
          </Table>

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
        </div>
      ) : (
        <div className="flex w-full flex-col justify-center space-y-4 p-4 md:pr-12">
          <Skeleton className="mb-4 h-6 w-full" />
          <Skeleton className="ml-4 h-8 w-3/4" />
          <Skeleton className="ml-4 h-8 w-1/2" />
          <Skeleton className="ml-4 h-8 w-1/4" />
          <Skeleton className="ml-4 h-8 w-1/3" />
          <div className="flex w-full justify-end">
            <Skeleton className="h-8 w-36" />
          </div>
        </div>
      )}
    </section>
  )
}
