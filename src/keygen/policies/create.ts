import config from "@/keygen/config"
import client from "@/keygen/client"

import { PolicyResponse } from "@/types/policies"
import { compact } from "@/lib/compact"

import * as Forms from "@/forms"

config.validate()

export default async function create(
  values: Forms.Policies.CreateValues,
): Promise<PolicyResponse> {
  const { product, entitlements, ...attributes } = values
  void entitlements

  const body = {
    data: {
      type: "policies",
      attributes: compact(attributes),
      relationships: {
        product: {
          data: {
            type: "product",
            id: product.id,
          },
        },
      },
    },
  }

  const result = (await client.request(`/accounts/${config.id}/policies`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as PolicyResponse

  return result
}
