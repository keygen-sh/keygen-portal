import config from "@/keygen/config"
import client from "@/keygen/client"
import { PRIVATE_API_PREFIX } from "@/keygen/analytics/prefix"
import { GaugeResponse } from "@/types/analytics"

config.validate()

export default async function events({
  event,
}: {
  event: string
}): Promise<GaugeResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/analytics/gauges/events/${encodeURIComponent(event)}`,
    {
      method: "GET",
      prefix: PRIVATE_API_PREFIX,
    },
  )) as GaugeResponse

  return result
}
