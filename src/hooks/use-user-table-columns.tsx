import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import {
  User,
  UserRoleLabels,
  UserStatusLabels,
  UserStatusVariants,
} from "@/types/users"

import { createTableColumnHelper } from "@/lib/tables"

import { TimestampCell } from "@/components/timestamp"
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
      }),
      column.attr("email", {
        header: "Email",
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
