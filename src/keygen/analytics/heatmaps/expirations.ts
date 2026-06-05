import config from "@/keygen/config"
import client from "@/keygen/client"
import { PRIVATE_API_PREFIX } from "@/keygen/analytics/prefix"
import { HeatmapResponse } from "@/types/analytics"

config.validate()

interface ExpirationsProps {
  start?: string // YYYY-MM-DD
  end?: string // YYYY-MM-DD
}

export default async function expirations({
  start,
  end,
}: ExpirationsProps = {}): Promise<HeatmapResponse> {
  const params = new URLSearchParams()
  if (start != null) {
    params.set("date[start]", start)
  }
  if (end != null) {
    params.set("date[end]", end)
  }

  const result = (await client.request(
    `/accounts/${config.id}/analytics/heatmaps/expirations?${params.toString()}`,
    {
      method: "GET",
      prefix: PRIVATE_API_PREFIX,
    },
  )) as HeatmapResponse

  return result
}
