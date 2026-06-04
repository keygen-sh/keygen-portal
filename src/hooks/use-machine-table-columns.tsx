import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { Machine } from "@/types/machines"

import { createTableColumnHelper } from "@/lib/tables"

import * as Tables from "@/components/tables"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Machine>()

export function useMachineTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("fingerprint", {
        header: "Fingerprint",
        cell: (info) =>
          info.getValue() || <Badge variant="disabled">Not set</Badge>,
      }),
      column.attr("name", {
        header: "Name",
        cell: (info) =>
          info.getValue() || <Badge variant="disabled">Not set</Badge>,
      }),
      column.rel("license", {
        sortingFn: "alphanumeric",
        header: "License",
        cell: (info) => <Tables.LicenseCell id={info.getValue()?.data?.id} />,
      }),
      column.rel("product", {
        sortingFn: "alphanumeric",
        header: "Product",
        cell: (info) => <Tables.ProductCell id={info.getValue()?.data?.id} />,
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
    [],
  )

  return columns
}
