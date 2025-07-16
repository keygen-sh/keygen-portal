import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { Product, ProductsData } from "@/types/products"

import * as keygen from "@/keygen"
import * as Products from "@/components/products"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import SkeletonTable from "@/components/skeleton-table"
import ClipboardButton from "@/components/clipboard-button"

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const navigate = useNavigate()

  const column = createColumnHelper<Product>()
  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      column.accessor("id", {
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.accessor("name", { header: "Name" }),
      column.accessor("code", { header: "Code" }),
      column.accessor("url", {
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
      column.accessor("created", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
      column.accessor("updated", {
        header: "Updated",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
    ],
    [],
  )

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      setTimeout(() => {
        setProducts(ProductsData ?? [])
        setLoading(false)
      }, 1000)
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

      {loading ? (
        <SkeletonTable />
      ) : (
        <DataTable<Product>
          data={products}
          columns={columns}
          hideOnMobile={["id", "url", "created", "updated"]}
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
