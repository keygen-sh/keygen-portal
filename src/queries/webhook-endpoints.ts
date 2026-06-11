import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { WebhookEndpoint } from "@/types/webhook-endpoints"

import * as keygen from "@/keygen"

export function useGetWebhookEndpoint(webhookEndpointId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["webhook-endpoints", webhookEndpointId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.webhookEndpoints.get({
        id: webhookEndpointId,
      })

      if (!response.data) {
        throw new Error("Webhook endpoint not found")
      }

      return response.data
    },
    enabled: !!webhookEndpointId,
  })
}

export function useListWebhookEndpoints(
  params?: {
    cursor?: string | null
    pageSize?: number
  },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["webhook-endpoints", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.webhookEndpoints.list(
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

export function useCreateWebhookEndpoint() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    WebhookEndpoint,
    APIError,
    Schemas.WebhookEndpoints.CreateValues
  >({
    mutationFn: async (values) => {
      const response = await keygen.webhookEndpoints.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newWebhookEndpoint) => {
      queryClient.setQueryData(
        ["webhook-endpoints", newWebhookEndpoint.id, { environment: code }],
        newWebhookEndpoint,
      )
      await queryClient.invalidateQueries({
        queryKey: ["webhook-endpoints", { environment: code }],
      })
    },
  })
}

export function useUpdateWebhookEndpoint(webhookEndpointId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    WebhookEndpoint,
    APIError,
    Schemas.WebhookEndpoints.UpdateValues
  >({
    mutationFn: async (values) => {
      const response = await keygen.webhookEndpoints.update({
        id: webhookEndpointId,
        values,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["webhook-endpoints", webhookEndpointId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["webhook-endpoints", { environment: code }],
      })
    },
  })
}

export function useRemoveWebhookEndpoint(webhookEndpointId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.webhookEndpoints.remove({ id: webhookEndpointId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["webhook-endpoints", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: [
          "webhook-endpoints",
          webhookEndpointId,
          { environment: code },
        ],
      })
    },
  })
}
