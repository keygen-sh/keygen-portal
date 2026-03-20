import config from "@/keygen/config"
import client from "@/keygen/client"

import { ReleaseResponse } from "@/types/releases"

config.validate()

interface YankProps {
  id: string
}

export default async function yank({
  id,
}: YankProps): Promise<ReleaseResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/releases/${id}/actions/yank`,
    { method: "POST" },
  )) as ReleaseResponse

  return result
}
