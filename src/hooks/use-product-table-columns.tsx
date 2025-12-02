import { useMemo } from "react"

import { Product } from "@/types/products"
import { createTableColumnHelper } from "@/lib/tables"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Product>()

export function useProductTableColumns() {
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

  return columns
}
