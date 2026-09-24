import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseFileResponse } from "@/types/licenses"

config.validate()

export interface CheckOutProps {
  id: string
  include?: string[]
  ttl?: number | null
  algorithm: string
}

export default async function checkOut({
  id,
  include,
  ttl,
  algorithm,
}: CheckOutProps): Promise<LicenseFileResponse> {
  const params = new URLSearchParams({ algorithm })

  if (include) {
    params.set("include", include.join(","))
  }

  if (ttl !== undefined) {
    params.set("ttl", ttl === null ? "" : String(ttl))
  }

  const result = (await client.request(
    `/accounts/${config.id}/licenses/${id}/actions/check-out?${params}`,
    { method: "POST" },
  )) as LicenseFileResponse

  return result
}
