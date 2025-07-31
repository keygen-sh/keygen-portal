import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import {
  Environment,
  CreateEnvironmentPayload,
  UpdateEnvironmentPayload,
} from "@/types/environments"
import { APIError } from "@/types/api"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useReadEnvironment(environmentId: string) {
  return useQuery({
    queryKey: ["environment", environmentId],
    queryFn: () =>
      keygen.environments
        .get({ id: environmentId })
        .then((response) => response.data as Environment),
  })
}

export function useReadEnvironments() {
  return useQuery({
    queryKey: ["environments"],
    queryFn: () =>
      keygen.environments.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient()

  return useMutation<Environment, APIError, CreateEnvironmentPayload>({
    mutationFn: (payload) =>
      keygen.environments
        .create(payload)
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

  return useMutation<Environment, APIError, UpdateEnvironmentPayload>({
    mutationFn: (values) =>
      keygen.environments.get({ id: environmentId }).then(async (response) => {
        const current = response.data as Environment

        const changes = diff(
          current.attributes,
          values,
        ) as UpdateEnvironmentPayload
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.environments
          .update({ id: environmentId, ...changes })
          .then((response) => response.data as Environment)

        return updated
      }),

    onSuccess: (updated) => {
      queryClient.setQueryData(["environment", environmentId], updated)
      queryClient.invalidateQueries({ queryKey: ["environments"] })
    },
  })
}

export function useDeleteEnvironment(environmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => keygen.environments.remove({ id: environmentId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] })
      queryClient.removeQueries({ queryKey: ["environment", environmentId] })
    },
  })
}
