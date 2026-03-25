import config from "@/keygen/config"
import client from "@/keygen/client"
import { ArtifactsListResponse } from "@/types/artifacts"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  product?: string
  release?: string
  channel?: string
  filetype?: string
  platform?: string
  arch?: string
  status?: string
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  product,
  release,
  channel,
  filetype,
  platform,
  arch,
  status,
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
  if (product != null) {
    params.set("product", product)
  }
  if (release != null) {
    params.set("release", release)
  }
  if (channel != null) {
    params.set("channel", channel)
  }
  if (filetype != null) {
    params.set("filetype", filetype)
  }
  if (platform != null) {
    params.set("platform", platform)
  }
  if (arch != null) {
    params.set("arch", arch)
  }
  if (status != null) {
    params.set("status", status)
  }

  const result = (await client.request(
    `/accounts/${config.id}/artifacts?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ArtifactsListResponse

  return result
}
