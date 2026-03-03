import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIError } from "@/types/api"

config.validate()

interface DetachEntitlementsProps {
  policyId: string
  entitlementIds: string[]
}

export default async function detachEntitlements({
  policyId,
  entitlementIds,
}: DetachEntitlementsProps): Promise<null> {
  const body = {
    data: entitlementIds.map((id) => ({
      type: "entitlements",
      id,
    })),
  }

  const response = await client.request(
    `/accounts/${config.id}/policies/${policyId}/entitlements`,
    {
      method: "DELETE",
      body: JSON.stringify(body),
    },
  )

  if (response.errors) {
    throw new APIError(response.errors[0])
  }

  return null
}
