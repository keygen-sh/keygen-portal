import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"

import { type RequestLog } from "@/types/request-logs"

import { createTableColumnHelper } from "@/lib/tables"
import { httpMethodBadgeVariant, httpStatusBadgeVariant } from "@/lib/http"

import { TimestampCell } from "@/components/timestamp"

const column = createTableColumnHelper<RequestLog>()

export function useRequestLogTableColumns() {
  const columns = useMemo(
    () => [
      column.attr("created", {
        sortingFn: "datetime",
        header: "Timestamp",
        cell: (info) => <TimestampCell value={info.getValue()} display="raw" />,
      }),
      column.attr("ip", {
        sortingFn: "alphanumeric",
        header: "IP",
        cell: (info) => {
          const ip = info.getValue()

          if (!ip) return <span className="text-content-muted">--</span>

          return (
            <span className="font-mono text-xs text-content-normal">{ip}</span>
          )
        },
      }),
      column.attr("status", {
        sortingFn: "alphanumeric",
        header: "Status",
        cell: (info) => {
          const status = info.getValue()

          if (!status) return <span className="text-content-muted">--</span>

          return (
            <Badge
              variant={httpStatusBadgeVariant(status)}
              className="font-mono"
            >
              {status}
            </Badge>
          )
        },
      }),
      column.attr("method", {
        sortingFn: "alphanumeric",
        header: "Method",
        cell: (info) => {
          const method = info.getValue()

          if (!method) return <span className="text-content-muted">--</span>

          return (
            <Badge
              variant={httpMethodBadgeVariant(method)}
              className="font-mono"
            >
              {method}
            </Badge>
          )
        },
      }),
      column.attr("url", {
        sortingFn: "alphanumeric",
        header: "URL",
        cell: (info) => {
          const url = info.getValue()

          if (!url) return <span className="text-content-muted">--</span>

          return (
            <span className="font-mono text-xs text-content-normal">{url}</span>
          )
        },
      }),
    ],
    [],
  )

  return columns
}
