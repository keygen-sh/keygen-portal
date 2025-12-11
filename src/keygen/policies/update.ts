import config from "@/keygen/config"
import client from "@/keygen/client"

import { PolicyResponse } from "@/types/policies"
import { compact } from "@/lib/compact"

import * as Forms from "@/forms"

config.validate()

interface UpdateProps {
  id: string
  values: Forms.Policies.UpdateValues
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
      attributes: compact(attributes),
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
