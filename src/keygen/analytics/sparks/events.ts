import config from "@/keygen/config"
import client from "@/keygen/client"
import { PRIVATE_API_PREFIX } from "@/keygen/analytics/prefix"
import { dateRangeParams } from "@/keygen/analytics/params"
import { DateRangeOptions, SparkResponse } from "@/types/analytics"

config.validate()

export default async function events({
  event,
  start,
  end,
}: DateRangeOptions & {
  event: string
}): Promise<SparkResponse> {
  const params = dateRangeParams({ start, end })

  const result = (await client.request(
    `/accounts/${config.id}/analytics/sparks/events/${encodeURIComponent(event)}?${params.toString()}`,
    {
      method: "GET",
      prefix: PRIVATE_API_PREFIX,
    },
  )) as SparkResponse

  return result
}
