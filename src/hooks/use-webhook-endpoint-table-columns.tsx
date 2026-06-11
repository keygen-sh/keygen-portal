import { useMemo } from "react"
import { formatDate } from "date-fns"

import { type WebhookEndpoint } from "@/types/webhook-endpoints"

import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<WebhookEndpoint>()

export function useWebhookEndpointTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => (
          <ClipboardButton value={info.getValue()} maxLength={8} />
        ),
      }),
      column.attr("url", {
        header: "URL",
        cell: (info) => (
          <span className="font-mono text-xs text-content-normal">
            {info.getValue()}
          </span>
        ),
      }),
      column.attr("created", {
        sortingFn: "datetime",
        header: "Created",
        cell: (info) => (
          <span className="font-mono text-xs text-content-normal">
            {formatDate(new Date(String(info.getValue())), "PP")}
          </span>
        ),
      }),
      column.attr("updated", {
        sortingFn: "datetime",
        header: "Updated",
        cell: (info) => (
          <span className="font-mono text-xs text-content-normal">
            {formatDate(new Date(String(info.getValue())), "PP")}
          </span>
        ),
      }),
    ],
    [],
  )

  return columns
}
