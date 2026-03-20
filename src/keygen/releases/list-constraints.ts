import config from "@/keygen/config"
import client from "@/keygen/client"
import { ReleaseConstraintListResponse } from "@/types/releases"

config.validate()

interface ListConstraintsProps {
  releaseId: string
  limit?: number
  pageNumber?: number
  pageSize?: number
}

export default async function listConstraints({
  releaseId,
  limit,
  pageNumber,
  pageSize,
}: ListConstraintsProps): Promise<ReleaseConstraintListResponse> {
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
    `/accounts/${config.id}/releases/${releaseId}/constraints?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ReleaseConstraintListResponse

  return result
}
