import config from "@/keygen/config"
import client from "@/keygen/client"

config.validate()

interface AttachEntitlementsProps {
  policyId: string
  entitlementIds: string[]
}

export default async function attachEntitlements({
  policyId,
  entitlementIds,
}: AttachEntitlementsProps): Promise<null> {
  const body = {
    data: entitlementIds.map((id) => ({
      type: "entitlements",
      id,
    })),
  }

  await client.request(
    `/accounts/${config.id}/policies/${policyId}/entitlements`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )

  return null
}
