import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIError } from "@/types/api"

config.validate()

interface DetachConstraintsProps {
  releaseId: string
  constraintIds: string[]
}

export default async function detachConstraints({
  releaseId,
  constraintIds,
}: DetachConstraintsProps): Promise<null> {
  const body = {
    data: constraintIds.map((id) => ({
      type: "constraints",
      id,
    })),
  }

  const response = await client.request(
    `/accounts/${config.id}/releases/${releaseId}/constraints`,
    {
      method: "DELETE",
      body: JSON.stringify(body),
    },
  )

  if (response.errors) {
    throw new APIError(response.errors[0])
  }

  return null
}
