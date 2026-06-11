import config from "@/keygen/config"
import client from "@/keygen/client"
import { EventResponse } from "@/types/events"

config.validate()

interface RetryProps {
  id: string
}

export default async function retry({
  id,
}: RetryProps): Promise<EventResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/webhook-events/${id}/actions/retry`,
    {
      method: "POST",
    },
  )) as EventResponse

  return result
}
