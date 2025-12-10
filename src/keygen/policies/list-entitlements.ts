import config from "@/keygen/config"
import client from "@/keygen/client"
import { EntitlementListResponse } from "@/types/entitlements"

config.validate()

interface ListEntitlementsProps {
  policyId: string
  limit?: number
  pageNumber?: number
  pageSize?: number
}

export default async function listEntitlements({
  policyId,
  limit,
  pageNumber,
  pageSize,
}: ListEntitlementsProps): Promise<EntitlementListResponse> {
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
    `/accounts/${config.id}/policies/${policyId}/entitlements?${params.toString()}`,
    {
      method: "GET",
    },
  )) as EntitlementListResponse

  return result
}
