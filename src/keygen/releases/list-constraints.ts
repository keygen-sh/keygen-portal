import config from "@/keygen/config"
import client from "@/keygen/client"
import { ReleaseConstraintListResponse } from "@/types/releases"

config.validate()

interface ListConstraintsProps {
  releaseId: string
  limit?: number
  pageCursor?: string | null
  pageSize?: number
}

export default async function listConstraints({
  releaseId,
  limit,
  pageCursor,
  pageSize,
}: ListConstraintsProps): Promise<ReleaseConstraintListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/releases/${releaseId}/constraints?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ReleaseConstraintListResponse

  return result
}
