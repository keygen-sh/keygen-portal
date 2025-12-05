import config from "@/keygen/config"
import client from "@/keygen/client"
import { EntitlementResponse } from "@/types/entitlements"

config.validate()

interface CreateProps {
  name: string
  code: string
  metadata?: Record<string, unknown> | null
}

export default async function create({
  name,
  code,
  metadata,
}: CreateProps): Promise<EntitlementResponse> {
  const body = {
    data: {
      type: "entitlements",
      attributes: {
        name,
        ...(code && { code }),
        ...(metadata && { metadata }),
      },
    },
  }

  const result = (await client.request(`/accounts/${config.id}/entitlements`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as EntitlementResponse

  return result
}
