import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Forms from "@/forms"

import { APIError } from "@/types/api"
import { Component } from "@/types/components"

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

export function useListComponents() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["components", { environment: code }],
    queryFn: () =>
      keygen.components.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateComponent() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Component, APIError, Forms.Components.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.components.create(values)

      if (response.errors && response.errors.length > 0) {
        throw response.errors[0]
      }

      return response.data as Component
    },

    onSuccess: (newComponent) => {
      queryClient.setQueryData<Component[]>(
        ["components", { environment: code }],
        (old) => (old ? [newComponent, ...old] : [newComponent]),
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

  return useMutation<Component, APIError, Forms.Components.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.components.get({ id: componentId })

      if (!getResponse.data) {
        throw new Error("Component not found")
      }

      const current = getResponse.data

      const changes = diff(
        {
          ...current.attributes,
        },
        values,
      ) as Forms.Components.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updated = await keygen.components
        .update({
          id: componentId,
          values: changes,
        })
        .then((response) => response.data as Component)

      return updated
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
