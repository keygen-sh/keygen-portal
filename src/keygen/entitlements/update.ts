import config from "@/keygen/config"
import client from "@/keygen/client"
import { EntitlementResponse } from "@/types/entitlements"

config.validate()

interface UpdateProps {
  id: string
  name?: string | null
  code?: string | null
  metadata?: Record<string, unknown> | null
}

export default async function update({
  id,
  name,
  code,
  metadata,
}: UpdateProps): Promise<EntitlementResponse> {
  const body = {
    data: {
      type: "entitlements",
      attributes: {
        ...(name && { name }),
        ...(code && { code }),
        ...(metadata && { metadata }),
      },
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/entitlements/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as EntitlementResponse

  return result
}
