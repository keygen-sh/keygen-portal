import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"

config.validate()

interface ChangeOwnerProps {
  id: string
  ownerId: string | null
}

export default async function changeOwner({
  id,
  ownerId,
}: ChangeOwnerProps): Promise<LicenseResponse> {
  const body = {
    data: ownerId ? { type: "users", id: ownerId } : null,
  }

  const result = (await client.request(
    `/accounts/${config.id}/licenses/${id}/owner`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  )) as LicenseResponse

  return result
}
