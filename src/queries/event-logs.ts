import { useQuery } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"
import { type EventLogFilters } from "@/types/event-logs"

import * as keygen from "@/keygen"

export type { EventLogFilters }

export function useGetEventLog(eventLogId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["event-logs", eventLogId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.eventLogs.get({ id: eventLogId })

      if (!response.data) {
        throw new Error("Event log not found")
      }

      return response.data
    },
    enabled: !!eventLogId,
  })
}

export function useListEventLogs(
  params?: {
    cursor?: string | null
    pageSize?: number
    filters?: EventLogFilters
  },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["event-logs", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.eventLogs.list(
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
