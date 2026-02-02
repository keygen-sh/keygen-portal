import config from "@/keygen/config"
import client from "@/keygen/client"

import { UserResponse } from "@/types/users"
import { compact } from "@/lib/compact"

import * as Forms from "@/forms"

config.validate()

export default async function create(
  values: Forms.Users.CreateValues,
): Promise<UserResponse> {
  const { groupId, ...attributes } = values

  const relationships: Record<string, unknown> = {}

  if (groupId) {
    relationships.group = {
      data: { type: "groups", id: groupId },
    }
  }

  const body = {
    data: {
      type: "users",
      attributes: compact(attributes),
      relationships:
        Object.keys(relationships).length > 0 ? relationships : undefined,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/users`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as UserResponse

  return result
}
