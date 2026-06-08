import config from "@/keygen/config"
import client from "@/keygen/client"
import { EnginesListResponse } from "@/types/engines"

config.validate()

interface ListProps {
  limit?: number
  pageCursor?: string | null
  pageSize?: number
}

export default async function list({
  limit,
  pageCursor,
  pageSize,
}: ListProps): Promise<EnginesListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/engines?${params.toString()}`,
    {
      method: "GET",
    },
  )) as EnginesListResponse

  return result
}
