import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"
import { EntitlementResponse } from "@/types/entitlements"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Entitlements.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<EntitlementResponse> {
  const body = {
    data: {
      type: "entitlements",
      attributes: compact(values),
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
