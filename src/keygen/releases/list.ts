import config from "@/keygen/config"
import client from "@/keygen/client"
import { ReleasesListResponse, type ReleaseFilters } from "@/types/releases"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
  filters?: ReleaseFilters
}

export default async function list({
  limit,
  pageCursor,
  pageSize,
  filters,
}: ListProps): Promise<ReleasesListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }
  if (filters?.status) {
    params.set("status", filters.status)
  }
  if (filters?.channel) {
    params.set("channel", filters.channel)
  }
  if (filters?.product) {
    params.set("product", filters.product)
  }
  if (filters?.package) {
    params.set("package", filters.package)
  }
  if (filters?.engine) {
    params.set("engine", filters.engine)
  }
  if (filters?.entitlements) {
    for (const entitlement of filters.entitlements) {
      params.append("entitlements[]", entitlement)
    }
  }

  const result = (await client.request(
    `/accounts/${config.id}/releases?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ReleasesListResponse

  return result
}
