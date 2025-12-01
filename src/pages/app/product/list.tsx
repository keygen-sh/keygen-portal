import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { createTableColumnHelper } from "@/lib/tables"
import { Product, } from "@/types/products"

import { useListProducts } from "@/queries/products"

import * as keygen from "@/keygen"
import * as Products from "@/components/products"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import SkeletonTable from "@/components/skeleton-table"
import ClipboardButton from "@/components/clipboard-button"

export default function ProductsList() {
  const { data: products = [], isLoading } = useListProducts()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const column = createTableColumnHelper<Product>()
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
      }),
      column.attr("code", {
        header: "Code",
      }),
      column.attr("url", {
        header: "URL",
        cell: (info) => (
          <a
            href={info.getValue()}
            target="_blank"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {info.getValue()}
          </a>
        ),
      }),
      column.attr("created", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
      column.attr("updated", {
        header: "Updated",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
    ],
    [],
  )

  const handleSelectProduct = (product: Product | null) => {
    if (!product) return

    navigate({
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
              Create Product
            </Button>
          </DialogTrigger>

          <Products.Create.Modal
            onSelectProduct={(product) => handleSelectProduct(product!)}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {isLoading ? (
        <SkeletonTable />
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
