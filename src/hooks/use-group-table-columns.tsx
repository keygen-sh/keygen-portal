import { useMemo } from "react"

import { Group } from "@/types/groups"

import { createTableColumnHelper } from "@/lib/tables"

import { TimestampCell } from "@/components/timestamp"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Group>()

export function useGroupTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
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
