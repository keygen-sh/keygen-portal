import config from "@/keygen/config"
import client from "@/keygen/client"

import { ReleaseResponse } from "@/types/releases"

config.validate()

interface PublishProps {
  id: string
}

export default async function publish({
  id,
}: PublishProps): Promise<ReleaseResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/releases/${id}/actions/publish`,
    { method: "POST" },
  )) as ReleaseResponse

  return result
}
