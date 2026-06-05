import { useQuery } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"

import * as keygen from "@/keygen"

export function useExpirationsHeatmap(options: { start: string; end: string }) {
  const { code } = useEnvironment()
  const { start, end } = options

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
