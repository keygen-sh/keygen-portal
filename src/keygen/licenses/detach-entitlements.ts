import config from "@/keygen/config"
import client from "@/keygen/client"

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

  await client.request(
    `/accounts/${config.id}/licenses/${licenseId}/entitlements`,
    {
      method: "DELETE",
      body: JSON.stringify(body),
    },
  )

  return null
}
