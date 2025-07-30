import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { Product } from "@/types/products"

import { useReadProducts } from "@/queries/products"

import * as keygen from "@/keygen"
import * as Products from "@/components/products"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import SkeletonTable from "@/components/skeleton-table"
import ClipboardButton from "@/components/clipboard-button"

export default function ProductsList() {
  const { data: products = [], isLoading } = useReadProducts()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const column = createColumnHelper<Product>()
  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      column.accessor((row) => row.id, {
        id: "attributes.id",
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.accessor((row) => row.attributes.name, {
        header: "Name",
        id: "attributes.name",
      }),
      column.accessor((row) => row.attributes.code, {
        header: "Code",
        id: "attributes.code",
      }),
      column.accessor((row) => row.attributes.url, {
        id: "attributes.url",
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
      column.accessor((row) => row.attributes.created, {
        id: "attributes.created",
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
      column.accessor((row) => row.attributes.updated, {
        id: "attributes.updated",
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
