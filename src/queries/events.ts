import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"
import { Event } from "@/types/events"

import * as keygen from "@/keygen"

export function useGetEvent(eventId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["webhook-events", eventId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.events.get({
        id: eventId,
      })

      if (!response.data) {
        throw new Error("Webhook event not found")
      }

      return response.data
    },
    enabled: !!eventId,
  })
}

export function useListEvents(
  params?: {
    cursor?: string | null
    pageSize?: number
  },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["webhook-events", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.events.list(
        params
          ? {
              pageCursor: params.cursor,
              pageSize: params.pageSize,
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

export function useRemoveEvent(eventId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.events.remove({ id: eventId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["webhook-events", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["webhook-events", eventId, { environment: code }],
      })
    },
  })
}

export function useRetryEvent(eventId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Event, APIError, void>({
    mutationFn: async () => {
      const response = await keygen.events.retry({ id: eventId })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newEvent) => {
      queryClient.setQueryData(
        ["webhook-events", newEvent.id, { environment: code }],
        newEvent,
      )
      await queryClient.invalidateQueries({
        queryKey: ["webhook-events", { environment: code }],
      })
    },
  })
}
