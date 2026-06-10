import config from "@/keygen/config"
import client from "@/keygen/client"
import { EndpointResponse } from "@/types/endpoints"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Endpoints.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<EndpointResponse> {
  const { product, ...attributes } = values

  const body = {
    data: {
      type: "webhook-endpoints",
      attributes: compact(attributes),
      relationships: {
        product: {
          data: product?.id ? { type: "products", id: product.id } : null,
        },
      },
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/webhook-endpoints/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as EndpointResponse

  return result
}
