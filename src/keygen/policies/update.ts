import config from "@/keygen/config"
import client from "@/keygen/client"

import { PolicyResponse } from "@/types/policies"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Policies.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<PolicyResponse> {
  const { entitlements, ...attributes } = values
  void entitlements

  const body = {
    data: {
      type: "policies",
      attributes,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/policies/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as PolicyResponse

  return result
}
