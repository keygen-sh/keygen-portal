import config from "@/keygen/config"
import client from "@/keygen/client"
import { WebhookEndpointResponse } from "@/types/webhook-endpoints"

config.validate()

interface GetProps {
  id: string
}

export default async function get({
  id,
}: GetProps): Promise<WebhookEndpointResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/webhook-endpoints/${id}`,
    {
      method: "GET",
    },
  )) as WebhookEndpointResponse

  return result
}
