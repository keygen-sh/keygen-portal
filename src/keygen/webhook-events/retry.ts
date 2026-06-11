import config from "@/keygen/config"
import client from "@/keygen/client"
import { WebhookEventResponse } from "@/types/webhook-events"

config.validate()

interface RetryProps {
  id: string
}

export default async function retry({
  id,
}: RetryProps): Promise<WebhookEventResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/webhook-events/${id}/actions/retry`,
    { method: "POST" },
  )) as WebhookEventResponse

  return result
}
