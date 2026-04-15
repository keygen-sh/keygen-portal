import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { Component, type ComponentFilters } from "@/types/components"

export type { ComponentFilters }

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetComponent(componentId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["components", componentId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.components.get({ id: componentId })

      if (!response.data) {
        throw new Error("Component not found")
      }

      return response.data
    },
    enabled: !!componentId,
  })
}

export function useListComponents(params?: {
  page: number
  pageSize: number
  filters?: ComponentFilters
}) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["components", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.components.list(
        params
          ? {
              pageNumber: params.page,
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
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreateComponent() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Component, APIError, Schemas.Components.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.components.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: (newComponent) => {
      queryClient.setQueryData(
        ["components", { environment: code }],
        (old: Component[] | undefined) => {
          if (Array.isArray(old)) return [newComponent, ...old]
          return undefined
        },
      )
      queryClient.setQueryData(
        ["components", newComponent.id, { environment: code }],
        newComponent,
      )
    },
  })
}

export function useUpdateComponent(componentId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Component, APIError, Schemas.Components.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.components.get({ id: componentId })

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(
        current.attributes,
        values,
      ) as Schemas.Components.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updateResponse = await keygen.components.update({
        id: componentId,
        values: changes,
      })

      if (updateResponse.errors) {
        throw new APIError(updateResponse.errors[0])
      }

      return updateResponse.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["components", componentId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["components", { environment: code }],
      })
    },
  })
}

export function useRemoveComponent(componentId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.components.remove({ id: componentId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["components", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["components", componentId, { environment: code }],
      })
    },
  })
}
