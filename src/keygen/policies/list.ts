import config from "@/keygen/config"
import client from "@/keygen/client"
import { PoliciesListResponse, type PolicyFilters } from "@/types/policies"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
  filters?: PolicyFilters
}

export default async function list({
  limit,
  pageCursor,
  pageSize,
  filters,
}: ListProps): Promise<PoliciesListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
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
