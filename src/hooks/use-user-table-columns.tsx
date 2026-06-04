import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import {
  User,
  UserRoleLabels,
  UserStatusLabels,
  UserStatusVariants,
} from "@/types/users"

import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<User>()

export function useUserTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("fullName", {
        header: "Name",
        cell: (info) =>
          info.getValue() || <Badge variant="disabled">Not set</Badge>,
      }),
      column.attr("email", {
        header: "Email",
        cell: (info) =>
          info.getValue() || <Badge variant="disabled">Not set</Badge>,
      }),
      column.attr("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue()
          return (
            <Badge variant={UserStatusVariants[status]}>
              {UserStatusLabels[status]}
            </Badge>
          )
        },
      }),
      column.attr("role", {
        header: "Role",
        cell: (info) => {
          const role = info.getValue()
          return UserRoleLabels[role] || role
        },
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
