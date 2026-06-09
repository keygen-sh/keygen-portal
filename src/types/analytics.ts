import { APIResponse } from "@/types/api"

export type ExpirationHeatmapEntry = {
  date: string
  x: number
  y: number
  temperature: number
  count: number
}

export type ExpirationHeatmap = {
  entries: ExpirationHeatmapEntry[]
  numWeeks: number
  monthLabels: { label: string; weekIndex: number }[]
}

export type HeatmapResponse = APIResponse<ExpirationHeatmapEntry[]>

export type SparkEntry = {
  metric: string
  date: string
  count: number
}

export type HeatmapEntry = {
  date: string
  x: number
  y: number
  temperature: number
  count: number
}

export type LeaderboardEntry = {
  discriminator: string
  count: number
}

export type GaugeEntry = {
  metric: string
  count: number
}

export type DateRangeOptions = {
  start?: string
  end?: string
}

export type SparkResponse = APIResponse<SparkEntry[]>
export type LeaderboardResponse = APIResponse<LeaderboardEntry[]>
export type GaugeResponse = APIResponse<GaugeEntry[]>
