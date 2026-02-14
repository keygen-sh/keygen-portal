import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"
import { ProductResponse } from "@/types/products"

config.validate()

interface CreateProps {
  values: Schemas.Products.CreateValues
}

export default async function create({
  values,
}: CreateProps): Promise<ProductResponse> {
  const body = {
    data: {
      type: "products",
      attributes: compact(values),
    },
  }

  const result = (await client.request(`/accounts/${config.id}/products`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as ProductResponse

  return result
}
