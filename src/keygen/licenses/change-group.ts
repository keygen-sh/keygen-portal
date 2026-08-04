import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"

config.validate()

interface ChangeGroupProps {
  id: string
  groupId: string | null
}

export default async function changeGroup({
  id,
  groupId,
}: ChangeGroupProps): Promise<LicenseResponse> {
  const body = {
    data: groupId ? { type: "groups", id: groupId } : null,
  }

  const result = (await client.request(
    `/accounts/${config.id}/licenses/${id}/group`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  )) as LicenseResponse

  return result
}
