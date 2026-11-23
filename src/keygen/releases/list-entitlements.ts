import config from "@/keygen/config"
import client from "@/keygen/client"
import { EntitlementListResponse } from "@/types/entitlements"

config.validate()

interface ListEntitlementsProps {
  releaseId: string
  limit?: number
  pageCursor?: string | null
  pageSize?: number
}

export default async function listEntitlements({
  releaseId,
  limit,
  pageCursor,
  pageSize,
}: ListEntitlementsProps): Promise<EntitlementListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/releases/${releaseId}/entitlements?${params.toString()}`,
    {
      method: "GET",
    },
  )) as EntitlementListResponse

  return result
}
