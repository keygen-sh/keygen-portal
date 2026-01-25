import config from "@/keygen/config"
import client from "@/keygen/client"

import { GroupResponse } from "@/types/groups"

import * as Forms from "@/forms"

config.validate()

interface UpdateProps {
  id: string
  values: Forms.Groups.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<GroupResponse> {
  const body = {
    data: {
      type: "groups",
      attributes: values,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })) as GroupResponse

  return result
}
