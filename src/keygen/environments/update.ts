import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Forms from "@/forms"
import { compact } from "@/lib/compact"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface UpdateProps {
  id: string
  values: Forms.Environments.UpdateValues
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
