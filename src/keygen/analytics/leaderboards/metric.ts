import config from "@/keygen/config"
import client from "@/keygen/client"
import { PRIVATE_API_PREFIX } from "@/keygen/analytics/prefix"
import { dateRangeParams } from "@/keygen/analytics/params"
import { DateRangeOptions, LeaderboardResponse } from "@/types/analytics"

config.validate()

export type RequestLeaderboardMetric =
  | "ips"
  | "urls"
  | "licenses"
  | "user-agents"

export default async function metric({
  leaderboard,
  limit,
  start,
  end,
}: DateRangeOptions & {
  leaderboard: RequestLeaderboardMetric
  limit?: number
}): Promise<LeaderboardResponse> {
  const params = dateRangeParams({ start, end })

  if (limit != null) {
    params.set("limit", String(limit))
  }

  const result = (await client.request(
    `/accounts/${config.id}/analytics/leaderboards/${leaderboard}?${params.toString()}`,
    {
      method: "GET",
      prefix: PRIVATE_API_PREFIX,
    },
  )) as LeaderboardResponse

  return result
}
