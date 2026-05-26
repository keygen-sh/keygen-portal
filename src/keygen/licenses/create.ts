import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Licenses.CreateValues,
): Promise<LicenseResponse> {
  const { policyId, ownerId, entitlements, users, ...attributes } = values
  void ownerId
  void entitlements
  void users

  const relationships: Record<string, unknown> = {
    policy: {
      data: { type: "policies", id: policyId },
    },
  }

  const body = {
    data: {
      type: "licenses",
      attributes: compact(attributes),
      relationships,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/licenses`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as LicenseResponse

  return result
}
