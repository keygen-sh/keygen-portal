import config from "@/keygen/config"
import client from "@/keygen/client"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface UpdateProps {
  id: string
  name?: string | null
  code?: string | null
}

export default async function update({
  id,
  name,
  code,
}: UpdateProps): Promise<EnvironmentResponse> {
  const body = {
    data: {
      type: "environments",
      attributes: {
        ...(name && { name }),
        ...(code && { code }),
      },
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/environments/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as EnvironmentResponse

  return result
}
