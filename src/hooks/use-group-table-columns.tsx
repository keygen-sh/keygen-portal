import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { Group } from "@/types/groups"

import { createTableColumnHelper } from "@/lib/tables"

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
        cell: (info) =>
          info.getValue() || <Badge variant="disabled">Not set</Badge>,
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
