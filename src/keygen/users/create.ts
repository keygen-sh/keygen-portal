import config from "@/keygen/config"
import client from "@/keygen/client"

import { UserResponse } from "@/types/users"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Users.CreateValues,
): Promise<UserResponse> {
  const { groupId, ...attributes } = values
  void groupId

  const body = {
    data: {
      type: "users",
      attributes: compact(attributes),
    },
  }

  const result = (await client.request(`/accounts/${config.id}/users`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as UserResponse

  return result
}
