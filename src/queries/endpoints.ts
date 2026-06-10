import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { Endpoint } from "@/types/endpoints"

import * as keygen from "@/keygen"

export function useGetEndpoint(endpointId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["webhook-endpoints", endpointId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.endpoints.get({
        id: endpointId,
      })

      if (!response.data) {
        throw new Error("Webhook endpoint not found")
      }

      return response.data
    },
    enabled: !!endpointId,
  })
}

export function useListEndpoints(
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
      const response = await keygen.endpoints.list(
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

export function useCreateEndpoint() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Endpoint, APIError, Schemas.Endpoints.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.endpoints.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newEndpoint) => {
      queryClient.setQueryData(
        ["webhook-endpoints", newEndpoint.id, { environment: code }],
        newEndpoint,
      )
      await queryClient.invalidateQueries({
        queryKey: ["webhook-endpoints", { environment: code }],
      })
    },
  })
}

export function useUpdateEndpoint(endpointId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Endpoint, APIError, Schemas.Endpoints.UpdateValues>({
    mutationFn: async (values) => {
      const response = await keygen.endpoints.update({
        id: endpointId,
        values,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["webhook-endpoints", endpointId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["webhook-endpoints", { environment: code }],
      })
    },
  })
}

export function useRemoveEndpoint(endpointId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.endpoints.remove({ id: endpointId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["webhook-endpoints", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["webhook-endpoints", endpointId, { environment: code }],
      })
    },
  })
}
