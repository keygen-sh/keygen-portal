import config from "@/keygen/config"
import client from "@/keygen/client"
import { ArtifactsListResponse } from "@/types/artifacts"

config.validate()

interface ListArtifactsProps {
  releaseId: string
  limit?: number
  pageCursor?: string | null
  pageSize?: number
}

export default async function listArtifacts({
  releaseId,
  limit,
  pageCursor,
  pageSize,
}: ListArtifactsProps): Promise<ArtifactsListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/releases/${releaseId}/artifacts?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ArtifactsListResponse

  return result
}
