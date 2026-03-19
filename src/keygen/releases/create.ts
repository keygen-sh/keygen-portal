import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"
import { ReleaseResponse } from "@/types/releases"

config.validate()

export default async function create(
  values: Schemas.Releases.CreateValues,
): Promise<ReleaseResponse> {
  const { productId, constraints, packages, ...attributes } = values

  void packages
  void constraints

  const relationships: Record<string, unknown> = {
    product: {
      data: { type: "products", id: productId },
    },
  }

  const body = {
    data: {
      type: "releases",
      attributes: compact(attributes),
      relationships,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/releases`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as ReleaseResponse

  return result
}
