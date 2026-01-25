import config from "@/keygen/config"
import client from "@/keygen/client"

import { GroupResponse } from "@/types/groups"
import { compact } from "@/lib/compact"

import * as Forms from "@/forms"

config.validate()

export default async function create(
  values: Forms.Groups.CreateValues,
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
