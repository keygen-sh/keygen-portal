import { useMemo } from "react"

import { Process } from "@/types/processes"

import { createTableColumnHelper } from "@/lib/tables"

import * as Tables from "@/components/tables"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Process>()

export function useProcessTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("pid", {
        header: "Pid",
        cell: (info) =>
          info.getValue() || <span className="text-content-muted">--</span>,
      }),
      column.rel("machine", {
        sortingFn: "alphanumeric",
        header: "Machine",
        cell: (info) => <Tables.MachineCell id={info.getValue()?.data?.id} />,
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
