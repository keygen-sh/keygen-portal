import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useProductTableColumns } from "@/hooks/use-product-table-columns"

import { Product } from "@/types/products"

import { useListProducts } from "@/queries/products"

import * as keygen from "@/keygen"
import * as Products from "@/components/products"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function ProductsList() {
  const { data: products = [], isLoading } = useListProducts()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const columns = useProductTableColumns()

  const handleSelectProduct = async (product: Product | null) => {
    if (!product) return

    await navigate({
      to: "/$id/app/products/$productId",
      params: { id: keygen.config.id, productId: product.id },
    })
    setOpen(false)
  }

  return (
    <section>
      <PageHeader title="Products">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={isLoading}>
              New Product
            </Button>
          </DialogTrigger>

          <Products.Create.Modal
            onSelectProduct={(product) => handleSelectProduct(product)}
            onClose={() => setOpen(false)}
          />
        </Dialog>
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
          onRowClick={(p) =>
            navigate({
              to: "/$id/app/products/$productId",
              params: { id: keygen.config.id, productId: p.id },
            })
          }
        />
      )}
    </section>
  )
}
