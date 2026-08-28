import config from "@/keygen/config"
import client from "@/keygen/client"

import { PolicyResponse } from "@/types/policies"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Policies.CreateValues,
  options?: { environment?: string | null },
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
    ...(options?.environment !== undefined
      ? { environment: options.environment }
      : {}),
  })) as PolicyResponse

  return result
}
