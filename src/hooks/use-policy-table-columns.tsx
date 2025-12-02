import { useMemo } from "react"

import { Policy } from "@/types/policies"

import { useListProducts } from "@/queries/products"

import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Policy>()

export function usePolicyTableColumns() {
  const { data: products = [] } = useListProducts()

  const productNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const product of products) map.set(product.id, product.attributes.name)
    return map
  }, [products])

  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
      }),
      column.rel("product", {
        sortingFn: "alphanumeric",
        header: "Product",
        cell: (info) => {
          const productId = info.getValue()?.data?.id ?? ""

          return (
            productNameById.get(productId) ?? (
              <span className="text-muted-foreground">--</span>
            )
          )
        },
      }),
      column.attr("created", {
        sortingFn: "datetime",
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      column.attr("updated", {
        sortingFn: "datetime",
        header: "Updated",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    [productNameById],
  )

  return columns
}
