import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import {
  type WebhookEvent,
  WebhookEventStatusLabels,
  WebhookEventStatusVariants,
} from "@/types/webhook-events"

import { eventLogBadgeVariant } from "@/lib/event-logs"
import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<WebhookEvent>()

export function useWebhookEventTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("endpoint", {
        header: "Endpoint",
        cell: (info) => (
          <span className="font-mono text-xs text-content-normal">
            {info.getValue()}
          </span>
        ),
      }),
      column.attr("event", {
        header: "Event",
        cell: (info) => {
          const event = info.getValue()

          return (
            <Badge variant={eventLogBadgeVariant(event)} className="font-mono">
              {event}
            </Badge>
          )
        },
      }),
      column.attr("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue()

          return (
            <Badge
              variant={WebhookEventStatusVariants[status]}
              className="font-mono"
            >
              {WebhookEventStatusLabels[status]}
            </Badge>
          )
        },
      }),
      column.attr("lastResponseCode", {
        header: "Last Response Code",
        cell: (info) => {
          const code = info.getValue()

          if (code == null)
            return <span className="text-content-muted">--</span>

          return (
            <span className="font-mono text-xs text-content-normal">
              {code}
            </span>
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

  return columns
}
