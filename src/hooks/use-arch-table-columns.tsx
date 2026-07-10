import { useMemo } from "react"

import { Arch } from "@/types/arches"
import { createTableColumnHelper } from "@/lib/tables"

import { TimestampCell } from "@/components/timestamp"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Arch>()

export function useArchTableColumns() {
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
        cell: (info) => <TimestampCell value={info.getValue()} />,
        sortingFn: "datetime",
      }),
    ],
    [],
  )

  return columns
}
