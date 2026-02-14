import config from "@/keygen/config"
import client from "@/keygen/client"

import { ComponentResponse } from "@/types/components"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Components.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<ComponentResponse> {
  const body = {
    data: {
      type: "components",
      attributes: values,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/components/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as ComponentResponse

  return result
}
