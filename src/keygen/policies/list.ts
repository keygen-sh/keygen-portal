import config from "@/keygen/config"
import client from "@/keygen/client"
import { PoliciesListResponse, type PolicyFilters } from "@/types/policies"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  filters?: PolicyFilters
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  filters,
}: ListProps): Promise<PoliciesListResponse> {
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

  const result = (await client.request(
    `/accounts/${config.id}/policies?${params.toString()}`,
    {
      method: "GET",
    },
  )) as PoliciesListResponse

  return result
}
