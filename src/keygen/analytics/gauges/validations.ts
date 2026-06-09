import config from "@/keygen/config"
import client from "@/keygen/client"
import { PRIVATE_API_PREFIX } from "@/keygen/analytics/prefix"
import { GaugeResponse } from "@/types/analytics"

config.validate()

export default async function validations({
  license,
}: {
  license?: string
} = {}): Promise<GaugeResponse> {
  const params = new URLSearchParams()

  if (license != null) {
    params.set("license", license)
  }

  const query = params.size ? `?${params.toString()}` : ""

  const result = (await client.request(
    `/accounts/${config.id}/analytics/gauges/validations${query}`,
    {
      method: "GET",
      prefix: PRIVATE_API_PREFIX,
    },
  )) as GaugeResponse

  return result
}
