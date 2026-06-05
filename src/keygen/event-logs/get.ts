import config from "@/keygen/config"
import client from "@/keygen/client"
import { EventLogResponse } from "@/types/event-logs"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<EventLogResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/event-logs/${id}`,
    {
      method: "GET",
    },
  )) as EventLogResponse

  return result
}
