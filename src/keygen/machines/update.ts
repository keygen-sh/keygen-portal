import config from "@/keygen/config"
import client from "@/keygen/client"

import { MachineResponse } from "@/types/machines"

import * as Forms from "@/forms"

config.validate()

interface UpdateProps {
  id: string
  values: Forms.Machines.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<MachineResponse> {
  const { groupId, ownerId, ...attributes } = values

  const body: {
    data: {
      type: string
      attributes: typeof attributes
      relationships?: Record<string, unknown>
    }
  } = {
    data: {
      type: "machines",
      attributes,
    },
  }

  // Only include relationships if they're explicitly being changed
  if (groupId !== undefined || ownerId !== undefined) {
    body.data.relationships = {}

    if (groupId !== undefined) {
      body.data.relationships.group = groupId
        ? { data: { type: "groups", id: groupId } }
        : { data: null }
    }

    if (ownerId !== undefined) {
      body.data.relationships.owner = ownerId
        ? { data: { type: "users", id: ownerId } }
        : { data: null }
    }
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
