import config from "@/keygen/config"
import client from "@/keygen/client"
import { PackagesListResponse, type PackageFilters } from "@/types/packages"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  filters?: PackageFilters
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  filters,
}: ListProps): Promise<PackagesListResponse> {
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
  if (filters?.product) {
    params.set("product", filters.product)
  }
  if (filters?.engine) {
    params.set("engine", filters.engine)
  }

  const result = (await client.request(
    `/accounts/${config.id}/packages?${params.toString()}`,
    {
      method: "GET",
    },
  )) as PackagesListResponse

  return result
}
