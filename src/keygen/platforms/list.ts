import config from "@/keygen/config"
import client from "@/keygen/client"
import { PlatformsListResponse } from "@/types/platforms"

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
}: ListProps): Promise<PlatformsListResponse> {
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
    `/accounts/${config.id}/platforms?${params.toString()}`,
    {
      method: "GET",
    },
  )) as PlatformsListResponse

  return result
}
