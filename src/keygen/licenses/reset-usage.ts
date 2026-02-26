import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"

config.validate()

interface ResetUsageProps {
  id: string
}

export default async function resetUsage({
  id,
}: ResetUsageProps): Promise<LicenseResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/licenses/${id}/actions/reset-usage`,
    { method: "POST" },
  )) as LicenseResponse

  return result
}
