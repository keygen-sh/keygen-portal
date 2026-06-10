import { useQuery } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"
import { DateRangeOptions } from "@/types/analytics"

import * as keygen from "@/keygen"

import { GaugeMetric } from "@/keygen/analytics/gauges/metric"
import { LeaderboardMetric } from "@/keygen/analytics/leaderboards/metric"
import { SparkMetric } from "@/keygen/analytics/sparks/metric"

export function useExpirationsHeatmap(options: {
  start: string
  end: string
  enabled?: boolean
}) {
  const { code } = useEnvironment()
  const { enabled, start, end } = options

  return useQuery({
    queryKey: [
      "analytics",
      "heatmaps",
      "expirations",
      { environment: code, start, end },
    ],
    queryFn: async () => {
      const response = await keygen.analytics.heatmaps.expirations({
        start,
        end,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: enabled ?? true,
    retry: false,
  })
}

export function useResourceGauge(
  metric: GaugeMetric,
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["analytics", "gauges", metric, { environment: code }],
    queryFn: async () => {
      const response = await keygen.analytics.gauges.metric({ metric })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useRequestSparks(
  range: DateRangeOptions,
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()
  const { start, end } = range

  return useQuery({
    queryKey: [
      "analytics",
      "sparks",
      "requests",
      { environment: code, start, end },
    ],
    queryFn: async () => {
      const response = await keygen.analytics.sparks.requests({ start, end })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useValidationSparks(
  range: DateRangeOptions & { license?: string },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()
  const { license, start, end } = range

  return useQuery({
    queryKey: [
      "analytics",
      "sparks",
      "validations",
      { environment: code, license, start, end },
    ],
    queryFn: async () => {
      const response = await keygen.analytics.sparks.validations({
        license,
        start,
        end,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useEventSparks(
  event: string,
  range: DateRangeOptions,
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()
  const { start, end } = range

  return useQuery({
    queryKey: [
      "analytics",
      "sparks",
      "events",
      event,
      { environment: code, start, end },
    ],
    queryFn: async () => {
      const response = await keygen.analytics.sparks.events({
        event,
        start,
        end,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useResourceSparks(
  metric: SparkMetric,
  range: DateRangeOptions,
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()
  const { start, end } = range

  return useQuery({
    queryKey: [
      "analytics",
      "sparks",
      metric,
      { environment: code, start, end },
    ],
    queryFn: async () => {
      const response = await keygen.analytics.sparks.metric({
        metric,
        start,
        end,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useRequestLeaderboard(
  leaderboard: LeaderboardMetric,
  options: DateRangeOptions & { limit?: number; enabled?: boolean },
) {
  const { code } = useEnvironment()
  const { limit, start, end, enabled } = options

  return useQuery({
    queryKey: [
      "analytics",
      "leaderboards",
      leaderboard,
      { environment: code, limit, start, end },
    ],
    queryFn: async () => {
      const response = await keygen.analytics.leaderboards.metric({
        leaderboard,
        limit,
        start,
        end,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: enabled ?? true,
    retry: false,
  })
}

export function useLicensesExpiringOn(
  date: string | null,
  options?: { limit?: number },
) {
  const { code } = useEnvironment()
  const limit = options?.limit

  return useQuery({
    queryKey: [
      "licenses",
      "expirations",
      "on",
      { environment: code, date, limit },
    ],
    queryFn: async () => {
      const response = await keygen.licenses.list({
        limit,
        filters: { expires: { on: date! } },
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: !!date,
    retry: false,
  })
}
