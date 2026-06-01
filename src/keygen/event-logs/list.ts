import config from "@/keygen/config"
import client from "@/keygen/client"
import {
  EventLogListResponse,
  type EventLogResourceFilter,
  type EventLogFilters,
} from "@/types/event-logs"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
  filters?: EventLogFilters
}

function applyResourceFilter(
  params: URLSearchParams,
  key: "resource" | "whodunnit",
  value: EventLogResourceFilter | undefined,
) {
  if (!value) return

  if (typeof value === "string") {
    params.set(key, value)
    return
  }

  params.set(`${key}[type]`, value.type)
  params.set(`${key}[id]`, value.id)
}

export default async function list({
  limit,
  pageCursor,
  pageSize,
  filters,
}: ListProps): Promise<EventLogListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }

  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }
  if (filters?.event) {
    params.set("event", filters.event)
  }
  if (filters?.request) {
    params.set("request", filters.request)
  }
  if (filters?.date?.start && filters?.date?.end) {
    params.set("date[start]", filters.date.start)
    params.set("date[end]", filters.date.end)
  }

  applyResourceFilter(params, "resource", filters?.resource)
  applyResourceFilter(params, "whodunnit", filters?.whodunnit)

  const result = (await client.request(
    `/accounts/${config.id}/event-logs?${params.toString()}`,
    {
      method: "GET",
    },
  )) as EventLogListResponse

  return result
}
