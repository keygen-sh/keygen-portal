import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { type EventLog } from "@/types/event-logs"

import { eventLogBadgeVariant } from "@/lib/event-logs"
import { createTableColumnHelper } from "@/lib/tables"

import * as Tables from "@/components/tables"
import { TimestampCell } from "@/components/timestamp"
import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<EventLog>()

function relationshipIdCell(id?: string) {
  if (!id) return <Tables.EmptyCell label="None" />

  return <ClipboardButton value={id} maxLength={8} />
}

export function useEventLogTableColumns() {
  const columns = useMemo(
    () => [
      column.attr("created", {
        sortingFn: "datetime",
        header: "Timestamp",
        cell: (info) => <TimestampCell value={info.getValue()} display="raw" />,
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
        cell: (info) => relationshipIdCell(info.getValue()?.data?.id),
      }),
      column.rel("request", {
        sortingFn: "alphanumeric",
        header: "Request",
        cell: (info) => relationshipIdCell(info.getValue()?.data?.id),
      }),
    ],
    [],
  )

  return columns
}
