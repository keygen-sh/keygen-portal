import { useMemo } from "react"

import { User } from "@/types/users"

import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<User>()

export function useTeamTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("fullName", {
        header: "Name",
        cell: (info) =>
          info.getValue() || <span className="text-content-muted">--</span>,
      }),
      column.attr("email", {
        header: "Email",
        cell: (info) =>
          info.getValue() || <span className="text-content-muted">--</span>,
      }),
      column.attr("role", {
        header: "Role",
        cell: (info) =>
          info.getValue() || <span className="text-content-muted">--</span>,
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
