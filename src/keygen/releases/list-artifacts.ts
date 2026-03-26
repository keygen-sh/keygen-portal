import config from "@/keygen/config"
import client from "@/keygen/client"
import { ArtifactsListResponse } from "@/types/artifacts"

config.validate()

interface ListArtifactsProps {
  releaseId: string
  limit?: number
  pageNumber?: number
  pageSize?: number
}

export default async function listArtifacts({
  releaseId,
  limit,
  pageNumber,
  pageSize,
}: ListArtifactsProps): Promise<ArtifactsListResponse> {
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
    `/accounts/${config.id}/releases/${releaseId}/artifacts?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ArtifactsListResponse

  return result
}
