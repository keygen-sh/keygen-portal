import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserListResponse, AllRoles } from "@/types/users"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
}: ListProps): Promise<UserListResponse> {
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

  AllRoles.forEach((role) => params.append("roles[]", role))

  const result = (await client.request(
    `/accounts/${config.id}/users?${params.toString()}`,
    {
      method: "GET",
    },
  )) as UserListResponse

  return result
}
