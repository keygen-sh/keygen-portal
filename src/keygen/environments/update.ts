import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Environments.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<EnvironmentResponse> {
  const body = {
    data: {
      type: "environments",
      attributes: compact(values),
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/environments/${id}`,
    {
      method: "PATCH",
      root: true,
      body: JSON.stringify(body),
    },
  )) as EnvironmentResponse

  return result
}
