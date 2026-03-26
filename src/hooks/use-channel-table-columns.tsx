import { useMemo } from "react"

import { Channel } from "@/types/channels"
import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Channel>()

export function useChannelTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("key", {
        header: "Key",
      }),
      column.attr("created", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
    ],
    [],
  )

  return columns
}
