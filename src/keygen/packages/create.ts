import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"
import { PackageResponse } from "@/types/packages"

config.validate()

export default async function create(
  values: Schemas.Packages.CreateValues,
): Promise<PackageResponse> {
  const { productId, ...attributes } = values

  const relationships: Record<string, unknown> = {
    product: {
      data: { type: "products", id: productId },
    },
  }

  const body = {
    data: {
      type: "packages",
      attributes: compact(attributes),
      relationships,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/packages`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as PackageResponse

  return result
}
