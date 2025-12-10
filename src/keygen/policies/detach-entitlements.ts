import config from "@/keygen/config"
import client from "@/keygen/client"

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

  await client.request(
    `/accounts/${config.id}/policies/${policyId}/entitlements`,
    {
      method: "DELETE",
      body: JSON.stringify(body),
    },
  )

  return null
}
