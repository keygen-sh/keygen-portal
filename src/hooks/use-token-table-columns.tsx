import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { Token, TokenKindLabels } from "@/types/tokens"

import { createTableColumnHelper } from "@/lib/tables"
import { isCurrentToken } from "@/lib/auth"

import * as Tables from "@/components/tables"
import ResourceLink from "@/components/resource-link"
import { TimestampCell } from "@/components/timestamp"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Token>()

export function useTokenTableColumns() {
  return useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("kind", {
        header: "Type",
        cell: (info) => {
          const kind = info.getValue()
          return (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{TokenKindLabels[kind] ?? kind}</Badge>
              {isCurrentToken(info.row.original.id) && (
                <Badge variant="success">Current</Badge>
              )}
            </div>
          )
        },
      }),
      column.attr("name", {
        header: "Name",
      }),
      column.rel("bearer", {
        header: "Bearer",
        enableSorting: false,
        cell: (info) => (
          <ResourceLink linkage={info.getValue()?.data} truncate />
        ),
      }),
      column.attr("expiry", {
        sortingFn: "datetime",
        header: "Expiry",
        cell: (info) => {
          const value = info.getValue()
          return value ? (
            <TimestampCell value={value} />
          ) : (
            <Tables.EmptyCell label="Never" />
          )
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
}
