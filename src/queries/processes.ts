import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { Process } from "@/types/processes"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetProcess(processId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["processes", processId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.processes.get({ id: processId })

      if (!response.data) {
        throw new Error("Process not found")
      }

      return response.data
    },
    enabled: !!processId,
  })
}

export function useListProcesses() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["processes", { environment: code }],
    queryFn: () =>
      keygen.processes.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateProcess() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Process, APIError, Schemas.Processes.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.processes.create(values)

      if (response.errors && response.errors.length > 0) {
        throw response.errors[0]
      }

      return response.data as Process
    },

    onSuccess: (newProcess) => {
      queryClient.setQueryData<Process[]>(
        ["processes", { environment: code }],
        (old) => (old ? [newProcess, ...old] : [newProcess]),
      )
      queryClient.setQueryData(
        ["processes", newProcess.id, { environment: code }],
        newProcess,
      )
    },
  })
}

export function useUpdateProcess(processId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Process, APIError, Schemas.Processes.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.processes.get({ id: processId })

      if (!getResponse.data) {
        throw new Error("Process not found")
      }

      const current = getResponse.data

      const changes = diff(
        {
          ...current.attributes,
        },
        values,
      ) as Schemas.Processes.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updated = await keygen.processes
        .update({
          id: processId,
          values: changes,
        })
        .then((response) => response.data as Process)

      return updated
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["processes", processId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["processes", { environment: code }],
      })
    },
  })
}

export function useRemoveProcess(processId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.processes.remove({ id: processId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["processes", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["processes", processId, { environment: code }],
      })
    },
  })
}
