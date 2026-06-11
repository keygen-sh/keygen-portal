import config from "@/keygen/config"
import client from "@/keygen/client"
import { WebhookEventResponse } from "@/types/webhook-events"

config.validate()

interface GetProps {
  id: string
}

export default async function get({
  id,
}: GetProps): Promise<WebhookEventResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/webhook-events/${id}`,
    {
      method: "GET",
    },
  )) as WebhookEventResponse

  return result
}
