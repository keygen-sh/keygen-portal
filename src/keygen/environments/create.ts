import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Forms from "@/forms"
import { compact } from "@/lib/compact"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface CreateProps {
  values: Forms.Environments.CreateValues
}

export default async function create({
  values,
}: CreateProps): Promise<EnvironmentResponse> {
  const body = {
    data: {
      type: "environments",
      attributes: compact(values),
    },
  }

  const result = (await client.request(`/accounts/${config.id}/environments`, {
    method: "POST",
    root: true,
    body: JSON.stringify(body),
  })) as EnvironmentResponse

  return result
}
