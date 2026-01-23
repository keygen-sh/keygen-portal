import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"
import { compact } from "@/lib/compact"

import * as Forms from "@/forms"

config.validate()

export default async function create(
  values: Forms.Licenses.CreateValues,
): Promise<LicenseResponse> {
  const { policyId, ...attributes } = values

  const body = {
    data: {
      type: "licenses",
      attributes: compact(attributes),
      relationships: {
        policy: {
          data: {
            type: "policies",
            id: policyId,
          },
        },
      },
    },
  }

  const result = (await client.request(`/accounts/${config.id}/licenses`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as LicenseResponse

  return result
}
