import config from "@/keygen/config"
import client from "@/keygen/client"
import { ProcessListResponse, type ProcessFilters } from "@/types/processes"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  filters?: ProcessFilters
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  filters,
}: ListProps): Promise<ProcessListResponse> {
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
  if (filters?.machine) {
    params.set("machine", filters.machine)
  }
  if (filters?.license) {
    params.set("license", filters.license)
  }
  if (filters?.owner) {
    params.set("owner", filters.owner)
  }
  if (filters?.user) {
    params.set("user", filters.user)
  }
  if (filters?.product) {
    params.set("product", filters.product)
  }

  const result = (await client.request(
    `/accounts/${config.id}/processes?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ProcessListResponse

  return result
}
