import config from "@/keygen/config"
import client from "@/keygen/client"
import { TokensListResponse, type TokenFilters } from "@/types/tokens"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
  filters?: TokenFilters
}

export default async function list({
  limit,
  pageCursor,
  pageSize,
  filters,
}: ListProps): Promise<TokensListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }
  if (filters?.bearerType) {
    params.set("bearer[type]", filters.bearerType)
  }
  if (filters?.bearerId) {
    params.set("bearer[id]", filters.bearerId)
  }
  if (filters?.bearerRoles?.length) {
    for (const role of filters.bearerRoles) {
      params.append("bearer[role][]", role)
    }
  }
  if (filters?.environment) {
    params.set("environment", filters.environment)
  }

  const result = (await client.request(
    `/accounts/${config.id}/tokens?${params.toString()}`,
    {
      method: "GET",
    },
  )) as TokensListResponse

  return result
}
