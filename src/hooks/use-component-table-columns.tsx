import { useMemo } from "react"

import { Component } from "@/types/components"

import { createTableColumnHelper } from "@/lib/tables"

import * as Tables from "@/components/tables"
import { TimestampCell } from "@/components/timestamp"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Component>()

export function useComponentTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
      }),
      column.attr("fingerprint", {
        header: "Fingerprint",
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
      column.attr("created", {
        sortingFn: "datetime",
        header: "Created",
        cell: (info) => <TimestampCell value={info.getValue()} />,
      }),
      column.attr("updated", {
        sortingFn: "datetime",
        header: "Updated",
        cell: (info) => <TimestampCell value={info.getValue()} />,
      }),
    ],
    [],
  )

  return columns
}
