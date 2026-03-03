import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIError } from "@/types/api"

config.validate()

interface DetachEntitlementsProps {
  licenseId: string
  entitlementIds: string[]
}

export default async function detachEntitlements({
  licenseId,
  entitlementIds,
}: DetachEntitlementsProps): Promise<null> {
  const body = {
    data: entitlementIds.map((id) => ({
      type: "entitlements",
      id,
    })),
  }

  const response = await client.request(
    `/accounts/${config.id}/licenses/${licenseId}/entitlements`,
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
