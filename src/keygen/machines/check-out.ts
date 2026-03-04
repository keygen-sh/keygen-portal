import config from "@/keygen/config"
import client from "@/keygen/client"

import { MachineFileResponse } from "@/types/machines"

config.validate()

export interface CheckOutProps {
  id: string
  include?: string[]
  ttl?: number
  algorithm: string
}

export default async function checkOut({
  id,
  include,
  ttl,
  algorithm,
}: CheckOutProps): Promise<MachineFileResponse> {
  const params = new URLSearchParams({ algorithm })

  if (include) {
    params.set("include", include.join(","))
  }

  if (ttl) {
    params.set("ttl", String(ttl))
  }

  const result = (await client.request(
    `/accounts/${config.id}/machines/${id}/actions/check-out?${params}`,
    { method: "POST" },
  )) as MachineFileResponse

  return result
}
