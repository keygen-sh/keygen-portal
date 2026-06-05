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
