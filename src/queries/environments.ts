import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import * as Schemas from "@/schemas"
import { Environment } from "@/types/environments"
import { APIError } from "@/types/api"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetEnvironment(environmentId: string) {
  return useQuery({
    queryKey: ["environment", environmentId],
    queryFn: () =>
      keygen.environments
        .get({ id: environmentId })
        .then((response) => response.data as Environment),
    enabled: !!environmentId,
  })
}

export function useListEnvironments(params?: {
  cursor?: string | null
  pageSize?: number
}) {
  const query = useQuery({
    queryKey: ["environments", { ...params }],
    queryFn: async () => {
      const response = await keygen.environments.list(
        params ? { pageCursor: params.cursor, pageSize: params.pageSize } : {},
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

export function useCreateEnvironment() {
  const queryClient = useQueryClient()

  return useMutation<Environment, APIError, Schemas.Environments.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.environments.create({ values })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newEnvironment) => {
      queryClient.setQueryData(
        ["environment", newEnvironment.id],
        newEnvironment,
      )
      await queryClient.invalidateQueries({
        queryKey: ["environments"],
      })
    },
  })
}

export function useUpdateEnvironment(environmentId: string) {
  const queryClient = useQueryClient()

  return useMutation<Environment, APIError, Schemas.Environments.UpdateValues>({
    mutationFn: (values) =>
      keygen.environments.get({ id: environmentId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values,
        ) as Schemas.Environments.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.environments.update({
          id: environmentId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(["environment", environmentId], updated)
      await queryClient.invalidateQueries({ queryKey: ["environments"] })
    },
  })
}

export function useRemoveEnvironment(environmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => keygen.environments.remove({ id: environmentId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["environments"] })
      queryClient.removeQueries({ queryKey: ["environment", environmentId] })
    },
  })
}
