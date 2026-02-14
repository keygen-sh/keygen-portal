import config from "@/keygen/config"
import client from "@/keygen/client"

import { ProcessResponse } from "@/types/processes"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Processes.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<ProcessResponse> {
  const body = {
    data: {
      type: "processes",
      attributes: values,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/processes/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as ProcessResponse

  return result
}
