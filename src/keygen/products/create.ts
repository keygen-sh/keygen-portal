import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"
import { ProductResponse } from "@/types/products"

config.validate()

interface CreateProps {
  values: Schemas.Products.CreateValues
  environment?: string | null
}

export default async function create({
  values,
  environment,
}: CreateProps): Promise<ProductResponse> {
  const { permissions, ...rest } = values

  const body = {
    data: {
      type: "products",
      attributes: compact({
        ...rest,
        permissions: !config.isCE ? permissions : undefined,
      }),
    },
  }

  const result = (await client.request(`/accounts/${config.id}/products`, {
    method: "POST",
    body: JSON.stringify(body),
    ...(environment !== undefined ? { environment } : {}),
  })) as ProductResponse

  return result
}
