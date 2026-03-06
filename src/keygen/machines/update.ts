import config from "@/keygen/config"
import client from "@/keygen/client"

import { MachineResponse } from "@/types/machines"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Machines.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<MachineResponse> {
  const { groupId, ownerId, ...attributes } = values
  void ownerId
  void groupId

  const body = {
    data: {
      type: "machines",
      attributes,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/machines/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as MachineResponse

  return result
}
