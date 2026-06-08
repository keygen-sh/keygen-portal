import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useProductTableColumns } from "@/hooks/use-product-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Product } from "@/types/products"

import { useListProducts } from "@/queries/products"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Products from "@/components/products"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ProductsList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useProductTableColumns()

  const {
    data: products,
    links,
    isLoading: productsLoading,
  } = useListProducts({
    cursor,
    pageSize,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Products">
        <Can permission="product.create">
          <Button
            size="sm"
            disabled={productsLoading}
            onClick={() => setOpen(true)}
          >
            New Product
          </Button>
        </Can>
        <Products.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Product>
          data={products}
          table={table}
          columns={columns}
          isLoading={productsLoading}
          onRowClick={(product) => navigateToResource(product)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={productsLoading}
        />
      </PageFooter>
    </section>
  )
}
