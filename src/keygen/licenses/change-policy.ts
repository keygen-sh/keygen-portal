import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"

config.validate()

interface ChangePolicyProps {
  id: string
  policyId: string
}

export default async function changePolicy({
  id,
  policyId,
}: ChangePolicyProps): Promise<LicenseResponse> {
  const body = {
    data: { type: "policies", id: policyId },
  }

  const result = (await client.request(
    `/accounts/${config.id}/licenses/${id}/policy`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  )) as LicenseResponse

  return result
}
