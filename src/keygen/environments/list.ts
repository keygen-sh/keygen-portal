import config from "@/keygen/config"
import client from "@/keygen/client"
import { EnvironmentsListResponse } from "@/types/environments"

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
}: ListProps): Promise<EnvironmentsListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/environments?${params.toString()}`,
    {
      method: "GET",
      root: true,
    },
  )) as EnvironmentsListResponse

  return result
}
