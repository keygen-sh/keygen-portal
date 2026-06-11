import config from "@/keygen/config"
import client from "@/keygen/client"

import { WebhookEndpointResponse } from "@/types/webhook-endpoints"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.WebhookEndpoints.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<WebhookEndpointResponse> {
  const { product, ...attributes } = values

  const relationships: Record<string, unknown> = {}
  if (product) {
    relationships.product = {
      data: product.id ? { type: "products", id: product.id } : null,
    }
  }

  const body = {
    data: {
      type: "webhook-endpoints",
      attributes,
      ...(Object.keys(relationships).length > 0 ? { relationships } : {}),
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/webhook-endpoints/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as WebhookEndpointResponse

  return result
}
