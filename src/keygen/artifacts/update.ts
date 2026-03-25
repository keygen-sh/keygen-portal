import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { ArtifactResponse } from "@/types/artifacts"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Artifacts.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<ArtifactResponse> {
  const body = {
    data: {
      type: "artifacts",
      attributes: values,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/artifacts/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as ArtifactResponse

  return result
}
