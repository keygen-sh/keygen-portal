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

export function useListEnvironments() {
  return useQuery({
    queryKey: ["environments"],
    queryFn: () =>
      keygen.environments.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient()

  return useMutation<Environment, APIError, Schemas.Environments.CreateValues>({
    mutationFn: (values) =>
      keygen.environments
        .create({ values })
        .then((response) => response.data as Environment),

    onSuccess: (newEnvironment) => {
      queryClient.setQueryData<Environment[]>(["environments"], (old) =>
        old ? [newEnvironment, ...old] : [newEnvironment],
      )
      queryClient.setQueryData(
        ["environment", newEnvironment.id],
        newEnvironment,
      )
    },
  })
}

export function useUpdateEnvironment(environmentId: string) {
  const queryClient = useQueryClient()

  return useMutation<Environment, APIError, Schemas.Environments.UpdateValues>({
    mutationFn: (values) =>
      keygen.environments.get({ id: environmentId }).then(async (response) => {
        const current = response.data as Environment

        const changes = diff(
          current.attributes,
          values,
        ) as Schemas.Environments.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.environments
          .update({ id: environmentId, values: changes })
          .then((response) => response.data as Environment)

        return updated
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
