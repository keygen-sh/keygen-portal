import config from "@/keygen/config"
import client from "@/keygen/client"
import { ReleasesListResponse } from "@/types/releases"

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
}: ListProps): Promise<ReleasesListResponse> {
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
    `/accounts/${config.id}/releases?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ReleasesListResponse

  return result
}
