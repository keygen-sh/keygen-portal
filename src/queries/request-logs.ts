import { useQuery } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"
import { type RequestLogFilters } from "@/types/request-logs"

import * as keygen from "@/keygen"

export type { RequestLogFilters }

export function useGetRequestLog(requestLogId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["request-logs", requestLogId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.requestLogs.get({ id: requestLogId })

      if (!response.data) {
        throw new Error("Request log not found")
      }

      return response.data
    },
    enabled: !!requestLogId,
  })
}

export function useListRequestLogs(
  params?: {
    cursor?: string | null
    pageSize?: number
    filters?: RequestLogFilters
  },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["request-logs", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.requestLogs.list(
        params
          ? {
              pageCursor: params.cursor,
              pageSize: params.pageSize,
              filters: params.filters,
            }
          : {},
      )

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response
    },
    enabled: options?.enabled,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}
