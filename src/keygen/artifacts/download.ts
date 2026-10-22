import config from "@/keygen/config"
import client from "@/keygen/client"
import { ArtifactResponse } from "@/types/artifacts"

config.validate()

interface DownloadProps {
  id: string
}

export default async function download({
  id,
}: DownloadProps): Promise<ArtifactResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/artifacts/${id}`,
    {
      method: "GET",
      headers: {
        Prefer: "no-redirect",
      },
    },
  )) as ArtifactResponse

  return result
}
