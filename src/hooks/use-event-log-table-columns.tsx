import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { type EventLog } from "@/types/event-logs"

import {
  eventLogBadgeVariant,
  formatEventLogRelativeTime,
  formatEventLogUtcTimestamp,
  formatEventLogLocalTimestamp,
} from "@/lib/event-logs"
import { createTableColumnHelper } from "@/lib/tables"

import {
  type EventLogPreview,
  type EventLogPreviewHandlers,
} from "@/components/event-logs/preview"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<EventLog>()

function timestampPreview(created: string): EventLogPreview {
  return {
    relative: formatEventLogRelativeTime(created),
    utc: formatEventLogUtcTimestamp(created),
    local: formatEventLogLocalTimestamp(created),
  }
}

function relationshipIdCell(id?: string, emptyLabel = "--") {
  if (!id) return <span className="text-content-muted">{emptyLabel}</span>

  return <ClipboardButton value={id} maxLength={8} />
}

export function useEventLogTableColumns(handlers: EventLogPreviewHandlers) {
  const columns = useMemo(
    () => [
      column.attr("created", {
        sortingFn: "datetime",
        header: "Timestamp",
        cell: (info) => {
          const created = info.getValue()

          return (
            <span
              className="block font-mono text-xs text-content-normal"
              onMouseEnter={(event) =>
                handlers.onOpenPreview(timestampPreview(created), event)
              }
              onMouseMove={handlers.onMovePreview}
              onMouseLeave={handlers.onClosePreview}
            >
              {created}
            </span>
          )
        },
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
      column.rel("resource", {
        sortingFn: "alphanumeric",
        header: "Resource",
        cell: (info) => relationshipIdCell(info.getValue()?.data?.id),
      }),
      column.rel("whodunnit", {
        sortingFn: "alphanumeric",
        header: "Actor",
        cell: (info) => relationshipIdCell(info.getValue()?.data?.id, "System"),
      }),
      column.rel("request", {
        sortingFn: "alphanumeric",
        header: "Request",
        cell: (info) => relationshipIdCell(info.getValue()?.data?.id),
      }),
    ],
    [handlers],
  )

  return columns
}
