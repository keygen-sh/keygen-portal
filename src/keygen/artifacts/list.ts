import config from "@/keygen/config"
import client from "@/keygen/client"
import { ArtifactsListResponse, type ArtifactFilters } from "@/types/artifacts"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  filters?: ArtifactFilters
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  filters,
}: ListProps): Promise<ArtifactsListResponse> {
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
  if (filters?.product) {
    params.set("product", filters.product)
  }
  if (filters?.release) {
    params.set("release", filters.release)
  }
  if (filters?.channel) {
    params.set("channel", filters.channel)
  }
  if (filters?.filetype) {
    params.set("filetype", filters.filetype)
  }
  if (filters?.platform) {
    params.set("platform", filters.platform)
  }
  if (filters?.arch) {
    params.set("arch", filters.arch)
  }
  if (filters?.status) {
    params.set("status", filters.status)
  }

  const result = (await client.request(
    `/accounts/${config.id}/artifacts?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ArtifactsListResponse

  return result
}
