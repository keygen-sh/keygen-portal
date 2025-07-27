import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Environment } from "@/types/environments"
import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useQueryEnvironment(environmentId: string) {
  return useQuery({
    queryKey: ["environment", environmentId],
    queryFn: () =>
      keygen.environments
        .get({ id: environmentId })
        .then((response) => response.data as Environment),
  })
}

export function useQueryEnvironments() {
  return useQuery({
    queryKey: ["environments"],
    queryFn: () =>
      keygen.environments.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: any) =>
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

  return useMutation({
    mutationFn: (values: any) =>
      keygen.environments.get({ id: environmentId }).then(async (response) => {
        const current = response.data as Environment
        const changes = diff(current.attributes, values)

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
