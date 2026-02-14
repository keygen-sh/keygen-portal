import config from "@/keygen/config"
import client from "@/keygen/client"

import { GroupResponse } from "@/types/groups"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Groups.CreateValues,
): Promise<GroupResponse> {
  const body = {
    data: {
      type: "groups",
      attributes: compact(values),
    },
  }

  const result = (await client.request(`/accounts/${config.id}/groups`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as GroupResponse

  return result
}
