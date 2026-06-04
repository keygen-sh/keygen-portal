import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { Release, ReleaseChannelLabels } from "@/types/releases"
import { createTableColumnHelper } from "@/lib/tables"

import * as Tables from "@/components/tables"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Release>()

export function useReleaseTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
        cell: (info) =>
          info.getValue() ?? <Badge variant="disabled">Not set</Badge>,
      }),
      column.attr("version", {
        header: "Version",
      }),
      column.attr("tag", {
        header: "Tag",
        cell: (info) =>
          info.getValue() ?? <Badge variant="disabled">Not set</Badge>,
      }),
      column.attr("channel", {
        header: "Channel",
        cell: (info) => ReleaseChannelLabels[info.getValue()],
      }),
      column.rel("product", {
        sortingFn: "alphanumeric",
        header: "Product",
        cell: (info) => <Tables.ProductCell id={info.getValue()?.data?.id} />,
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
