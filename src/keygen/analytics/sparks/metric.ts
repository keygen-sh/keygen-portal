import config from "@/keygen/config"
import client from "@/keygen/client"
import { PRIVATE_API_PREFIX } from "@/keygen/analytics/prefix"
import { dateRangeParams } from "@/keygen/analytics/params"
import { DateRangeOptions, SparkResponse } from "@/types/analytics"

config.validate()

export type SparkMetric = "licenses" | "machines" | "users" | "alus"

export default async function metric({
  metric,
  start,
  end,
}: DateRangeOptions & {
  metric: SparkMetric
}): Promise<SparkResponse> {
  const params = dateRangeParams({ start, end })

  const result = (await client.request(
    `/accounts/${config.id}/analytics/sparks/${metric}?${params.toString()}`,
    {
      method: "GET",
      prefix: PRIVATE_API_PREFIX,
    },
  )) as SparkResponse

  return result
}
