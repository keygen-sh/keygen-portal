import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIError } from "@/types/api"

config.validate()

interface AttachConstraintsProps {
  releaseId: string
  entitlementIds: string[]
}

export default async function attachConstraints({
  releaseId,
  entitlementIds,
}: AttachConstraintsProps): Promise<null> {
  const body = {
    data: entitlementIds.map((id) => ({
      type: "constraints",
      relationships: {
        entitlement: {
          data: { type: "entitlements", id },
        },
      },
    })),
  }

  const response = await client.request(
    `/accounts/${config.id}/releases/${releaseId}/constraints`,
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
