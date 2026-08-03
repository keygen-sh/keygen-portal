import { useMemo } from "react"

import { Release, ReleaseChannelLabels } from "@/types/releases"
import { createTableColumnHelper } from "@/lib/tables"

import * as Tables from "@/components/tables"
import { TimestampCell } from "@/components/timestamp"
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
      }),
      column.attr("version", {
        header: "Version",
      }),
      column.attr("tag", {
        header: "Tag",
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
        cell: (info) => <TimestampCell value={info.getValue()} />,
        sortingFn: "datetime",
      }),
      column.attr("updated", {
        header: "Updated",
        cell: (info) => <TimestampCell value={info.getValue()} />,
        sortingFn: "datetime",
      }),
    ],
    [],
  )

  return columns
}
