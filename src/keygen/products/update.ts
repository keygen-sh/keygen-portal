import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Forms from "@/forms"
import { compact } from "@/lib/compact"
import { ProductResponse } from "@/types/products"

config.validate()

interface UpdateProps {
  id: string
  values: Forms.Products.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<ProductResponse> {
  const body = {
    data: {
      type: "products",
      attributes: compact(values),
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/products/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as ProductResponse

  return result
}
