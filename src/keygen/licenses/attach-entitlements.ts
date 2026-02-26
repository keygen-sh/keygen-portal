import config from "@/keygen/config"
import client from "@/keygen/client"

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

  await client.request(
    `/accounts/${config.id}/licenses/${licenseId}/entitlements`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )

  return null
}
