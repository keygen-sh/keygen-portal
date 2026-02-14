import config from "@/keygen/config"
import client from "@/keygen/client"

import { UserResponse } from "@/types/users"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Users.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<UserResponse> {
  const { groupId, ...attributes } = values

  const body: {
    data: {
      type: string
      attributes: typeof attributes
      relationships?: Record<string, unknown>
    }
  } = {
    data: {
      type: "users",
      attributes,
    },
  }

  // Only include relationships if they're explicitly being changed
  if (groupId !== undefined) {
    body.data.relationships = {}

    body.data.relationships.group = groupId
      ? { data: { type: "groups", id: groupId } }
      : { data: null }
  }

  const result = (await client.request(`/accounts/${config.id}/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })) as UserResponse

  return result
}
