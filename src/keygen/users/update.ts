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
  void groupId

  const body = {
    data: {
      type: "users",
      attributes,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })) as UserResponse

  return result
}
