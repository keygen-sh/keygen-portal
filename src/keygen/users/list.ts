import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserListResponse, AllRoles, type UserFilters } from "@/types/users"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
  filters?: UserFilters
}

export default async function list({
  limit,
  pageCursor,
  pageSize,
  filters,
}: ListProps): Promise<UserListResponse> {
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
  if (filters?.assigned != null) {
    params.set("assigned", filters.assigned.toString())
  }
  if (filters?.product) {
    params.set("product", filters.product)
  }
  if (filters?.group) {
    params.set("group", filters.group)
  }

  const roles = filters?.roles ?? AllRoles
  roles.forEach((role) => params.append("roles[]", role))

  if (filters?.metadata) {
    for (const [key, value] of Object.entries(filters.metadata)) {
      params.set(`metadata[${key}]`, value)
    }
  }

  const result = (await client.request(
    `/accounts/${config.id}/users?${params.toString()}`,
    {
      method: "GET",
    },
  )) as UserListResponse

  return result
}
