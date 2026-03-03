import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserListResponse } from "@/types/users"

config.validate()

interface ListUsersProps {
  licenseId: string
  limit?: number
  pageNumber?: number
  pageSize?: number
}

export default async function listUsers({
  licenseId,
  limit,
  pageNumber,
  pageSize,
}: ListUsersProps): Promise<UserListResponse> {
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

  const result = (await client.request(
    `/accounts/${config.id}/licenses/${licenseId}/users?${params.toString()}`,
    {
      method: "GET",
    },
  )) as UserListResponse

  return result
}
