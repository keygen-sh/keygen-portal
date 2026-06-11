import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"
import { WebhookEvent } from "@/types/webhook-events"

import * as keygen from "@/keygen"

export function useGetWebhookEvent(webhookEventId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["webhook-events", webhookEventId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.webhookEvents.get({ id: webhookEventId })

      if (!response.data) {
        throw new Error("Webhook event not found")
      }

      return response.data
    },
    enabled: !!webhookEventId,
  })
}

export function useListWebhookEvents(
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
      const response = await keygen.webhookEvents.list(
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

export function useRemoveWebhookEvent(webhookEventId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.webhookEvents.remove({ id: webhookEventId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["webhook-events", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["webhook-events", webhookEventId, { environment: code }],
      })
    },
  })
}

export function useRetryWebhookEvent(webhookEventId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<WebhookEvent, APIError>({
    mutationFn: async () => {
      const response = await keygen.webhookEvents.retry({ id: webhookEventId })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newWebhookEvent) => {
      queryClient.setQueryData(
        ["webhook-events", newWebhookEvent.id, { environment: code }],
        newWebhookEvent,
      )
      await queryClient.invalidateQueries({
        queryKey: ["webhook-events", { environment: code }],
      })
    },
  })
}
