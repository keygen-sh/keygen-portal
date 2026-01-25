import config from "@/keygen/config"
import client from "@/keygen/client"
import { GroupListResponse } from "@/types/groups"

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
}: ListProps): Promise<GroupListResponse> {
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
    `/accounts/${config.id}/groups?${params.toString()}`,
    {
      method: "GET",
    },
  )) as GroupListResponse

  return result
}
