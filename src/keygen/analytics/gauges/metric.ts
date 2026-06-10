import config from "@/keygen/config"
import client from "@/keygen/client"
import { PRIVATE_API_PREFIX } from "@/keygen/analytics/prefix"
import { GaugeResponse } from "@/types/analytics"

config.validate()

export type GaugeMetric =
  | "machines"
  | "users"
  | "licenses"
  | "alus"
  | "requests"

export default async function metric({
  metric,
}: {
  metric: GaugeMetric
}): Promise<GaugeResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/analytics/gauges/${metric}`,
    {
      method: "GET",
      prefix: PRIVATE_API_PREFIX,
    },
  )) as GaugeResponse

  return result
}
