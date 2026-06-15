import config from "@/keygen/config"
import client from "@/keygen/client"
import { GroupOwnerListResponse } from "@/types/groups"

config.validate()

interface ListOwnersProps {
  groupId: string
  limit?: number
  pageCursor?: string | null
  pageSize?: number
}

export default async function listOwners({
  groupId,
  limit,
  pageCursor,
  pageSize,
}: ListOwnersProps): Promise<GroupOwnerListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/groups/${groupId}/owners?${params.toString()}`,
    {
      method: "GET",
    },
  )) as GroupOwnerListResponse

  return result
}
