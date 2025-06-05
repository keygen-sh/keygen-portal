import config from "@/keygen/config"
import client from "@/keygen/client"
import { EnvironmentsListResponse } from "@/types/environments"

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
}: ListProps): Promise<EnvironmentsListResponse> {
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
    `/accounts/${config.id}/environments?${params.toString()}`,
    {
      method: "GET",
    },
  )) as EnvironmentsListResponse

  return result
}
