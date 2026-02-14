import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useProductTableColumns } from "@/hooks/use-product-table-columns"

import { Product } from "@/types/products"

import { useListProducts } from "@/queries/products"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Products from "@/components/products"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function ProductsList() {
  const { data: products = [], isLoading } = useListProducts()
  const columns = useProductTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section>
      <PageHeader title="Products">
        <Button size="sm" disabled={isLoading} onClick={() => setOpen(true)}>
          New Product
        </Button>
        <Products.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      {isLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Product>
          data={products}
          columns={columns}
          hideOnMobile={[
            "attributes.id",
            "attributes.url",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(product) => navigateToResource(product)}
        />
      )}
    </section>
  )
}
