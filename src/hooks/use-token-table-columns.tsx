import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { Token, TokenKindLabels } from "@/types/tokens"

import { createTableColumnHelper } from "@/lib/tables"

import ResourceLink from "@/components/resource-link"
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
            <Badge variant="secondary">{TokenKindLabels[kind] ?? kind}</Badge>
          )
        },
      }),
      column.attr("name", {
        header: "Name",
        cell: (info) =>
          info.getValue() || <span className="text-content-muted">--</span>,
      }),
      column.rel("bearer", {
        header: "Bearer",
        enableSorting: false,
        cell: (info) => <ResourceLink linkage={info.getValue()?.data} />,
      }),
      column.attr("expiry", {
        sortingFn: "datetime",
        header: "Expiry",
        cell: (info) => {
          const value = info.getValue()
          return value ? (
            new Date(value).toLocaleDateString()
          ) : (
            <span className="text-content-subdued">Never</span>
          )
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
}
