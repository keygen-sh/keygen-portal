import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { Machine } from "@/types/machines"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetMachine(machineId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["machines", machineId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.machines.get({ id: machineId })

      if (!response.data) {
        throw new Error("Machine not found")
      }

      return response.data
    },
    enabled: !!machineId,
  })
}

export function useListMachines() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["machines", { environment: code }],
    queryFn: () =>
      keygen.machines.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateMachine() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Machine, APIError, Schemas.Machines.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.machines.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: (newMachine) => {
      queryClient.setQueryData<Machine[]>(
        ["machines", { environment: code }],
        (old) => (old ? [newMachine, ...old] : [newMachine]),
      )
      queryClient.setQueryData(
        ["machines", newMachine.id, { environment: code }],
        newMachine,
      )
    },
  })
}

export function useUpdateMachine(machineId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Machine, APIError, Schemas.Machines.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.machines.get({ id: machineId })

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(
        {
          ...current.attributes,
          groupId: current.relationships.group?.data?.id ?? null,
          ownerId: current.relationships.owner?.data?.id ?? null,
        },
        values,
      ) as Schemas.Machines.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updateResponse = await keygen.machines.update({
        id: machineId,
        values: changes,
      })

      if (updateResponse.errors) {
        throw new APIError(updateResponse.errors[0])
      }

      return updateResponse.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["machines", machineId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["machines", { environment: code }],
      })
    },
  })
}

export function useRemoveMachine(machineId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.machines.remove({ id: machineId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["machines", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["machines", machineId, { environment: code }],
      })
    },
  })
}
