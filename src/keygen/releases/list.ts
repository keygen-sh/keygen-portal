import config from "@/keygen/config"
import client from "@/keygen/client"
import { ReleasesListResponse, type ReleaseFilters } from "@/types/releases"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  filters?: ReleaseFilters
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  filters,
}: ListProps): Promise<ReleasesListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageNumber != null) {
    params.set("page[number]", pageNumber.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
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
