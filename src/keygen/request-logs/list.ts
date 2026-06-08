import config from "@/keygen/config"
import client from "@/keygen/client"
import {
  RequestLogListResponse,
  type RequestLogResourceFilter,
  type RequestLogFilters,
} from "@/types/request-logs"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
  filters?: RequestLogFilters
}

function applyPolymorphicResourceFilter(
  params: URLSearchParams,
  key: "resource" | "requestor",
  value: RequestLogResourceFilter | undefined,
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
}: ListProps): Promise<RequestLogListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }

  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }
  if (filters?.method) {
    params.set("method", filters.method)
  }
  if (filters?.status) {
    params.set("status", filters.status)
  }
  if (filters?.ip) {
    params.set("ip", filters.ip)
  }
  if (filters?.url) {
    params.set("url", filters.url)
  }
  if (filters?.date?.start && filters?.date?.end) {
    params.set("date[start]", filters.date.start)
    params.set("date[end]", filters.date.end)
  }

  applyPolymorphicResourceFilter(params, "resource", filters?.resource)
  applyPolymorphicResourceFilter(params, "requestor", filters?.requestor)

  const result = (await client.request(
    `/accounts/${config.id}/request-logs?${params.toString()}`,
    {
      method: "GET",
    },
  )) as RequestLogListResponse

  return result
}
