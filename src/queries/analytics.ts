import { useQuery, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"
import { cursorFromLink } from "@/hooks/use-cursors"

import { licensesToCsv } from "@/lib/csv"
import { downloadCsv } from "@/lib/download"
import { toast } from "@/lib/toast"

import { APIError } from "@/types/api"
import { DateRangeOptions } from "@/types/analytics"
import { License } from "@/types/licenses"

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

export function useGauge(metric: GaugeMetric, options?: { enabled?: boolean }) {
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

export function useRequestSpark(
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

export function useValidationSpark(
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

export function useEventSpark(
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

export function useSpark(
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

export function useLeaderboard(
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

const EXPORT_PAGE_SIZE = 100
const MAX_EXPORT_PAGES = 10
const EXPORT_LIMIT = EXPORT_PAGE_SIZE * MAX_EXPORT_PAGES

class ExportLimitError extends Error {
  constructor() {
    super(`Exports are limited to ${EXPORT_LIMIT.toLocaleString()} licenses.`)
    this.name = "ExportLimitError"
  }
}

export function useExportExpiringLicenses() {
  const { code } = useEnvironment()

  return useMutation<
    License[],
    APIError | ExportLimitError,
    { before: string; count: number; filename: string }
  >({
    mutationFn: async ({ before, count }) => {
      if (count > EXPORT_LIMIT) {
        throw new ExportLimitError()
      }

      const licenses: License[] = []
      let cursor: string | null = null
      let pages = 0

      do {
        const response = await keygen.licenses.list({
          pageSize: EXPORT_PAGE_SIZE,
          pageCursor: cursor,
          filters: { expires: { before } },
          environment: code,
        })

        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        licenses.push(...(response.data ?? []))
        cursor = cursorFromLink(response.links?.next)
        pages += 1
      } while (cursor && pages < MAX_EXPORT_PAGES)

      if (cursor) {
        throw new ExportLimitError()
      }

      return licenses
    },
    onSuccess: (licenses, { filename }) => {
      if (!licenses.length) {
        toast({
          message: "No licenses expiring in this range",
          variant: "warning",
        })
        return
      }

      downloadCsv(licensesToCsv(licenses), filename)

      toast({
        message: `Exported ${licenses.length} ${licenses.length === 1 ? "license" : "licenses"}`,
        variant: "success",
      })
    },
    onError: (error) => {
      toast({
        message:
          error instanceof ExportLimitError
            ? error.message
            : "Failed to export licenses",
        variant: "error",
      })
    },
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
