import config from "@/keygen/config"
import client from "@/keygen/client"
import { EventResponse } from "@/types/events"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<EventResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/webhook-events/${id}`,
    {
      method: "GET",
    },
  )) as EventResponse

  return result
}
