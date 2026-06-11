import config from "@/keygen/config"
import client from "@/keygen/client"
import { WebhookEndpointResponse } from "@/types/webhook-endpoints"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.WebhookEndpoints.CreateValues,
): Promise<WebhookEndpointResponse> {
  const { product, ...attributes } = values

  const relationships: Record<string, unknown> = {}
  if (product?.id) {
    relationships.product = {
      data: { type: "products", id: product.id },
    }
  }

  const body = {
    data: {
      type: "webhook-endpoints",
      attributes: compact(attributes),
      ...(Object.keys(relationships).length > 0 ? { relationships } : {}),
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/webhook-endpoints`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )) as WebhookEndpointResponse

  return result
}
