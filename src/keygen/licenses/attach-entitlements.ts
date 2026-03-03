import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIError } from "@/types/api"

config.validate()

interface AttachEntitlementsProps {
  licenseId: string
  entitlementIds: string[]
}

export default async function attachEntitlements({
  licenseId,
  entitlementIds,
}: AttachEntitlementsProps): Promise<null> {
  const body = {
    data: entitlementIds.map((id) => ({
      type: "entitlements",
      id,
    })),
  }

  const response = await client.request(
    `/accounts/${config.id}/licenses/${licenseId}/entitlements`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )

  if (response.errors) {
    throw new APIError(response.errors[0])
  }

  return null
}
