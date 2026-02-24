import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"

config.validate()

interface ReinstateProps {
  id: string
}

export default async function reinstate({
  id,
}: ReinstateProps): Promise<LicenseResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/licenses/${id}/actions/reinstate`,
    { method: "POST" },
  )) as LicenseResponse

  return result
}
