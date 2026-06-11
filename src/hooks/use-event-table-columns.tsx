import { useMemo } from "react"
import { formatDate } from "date-fns"

import { Badge } from "@/components/ui/badge"

import { type Event, EventStatusVariants } from "@/types/events"

import { createTableColumnHelper } from "@/lib/tables"

import ClipboardButton from "@/components/clipboard-button"

const column = createTableColumnHelper<Event>()

export function useEventTableColumns() {
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => (
          <ClipboardButton value={info.getValue()} maxLength={8} />
        ),
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
        cell: (info) => (
          <span className="font-mono text-xs text-content-normal">
            {info.getValue()}
          </span>
        ),
      }),
      column.attr("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue()

          return (
            <Badge variant={EventStatusVariants[status]} className="font-mono">
              {status}
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
