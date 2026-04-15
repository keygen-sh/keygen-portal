import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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

export function useListProcesses(params?: { page: number; pageSize: number }) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["processes", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.processes.list(
        params ? { pageNumber: params.page, pageSize: params.pageSize } : {},
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

export function useCreateProcess() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Process, APIError, Schemas.Processes.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.processes.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newProcess) => {
      queryClient.setQueryData(
        ["processes", newProcess.id, { environment: code }],
        newProcess,
      )
      await queryClient.invalidateQueries({
        queryKey: ["processes", { environment: code }],
      })
    },
  })
}

export function useUpdateProcess(processId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Process, APIError, Schemas.Processes.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.processes.get({ id: processId })

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(
        current.attributes,
        values,
      ) as Schemas.Processes.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updateResponse = await keygen.processes.update({
        id: processId,
        values: changes,
      })

      if (updateResponse.errors) {
        throw new APIError(updateResponse.errors[0])
      }

      return updateResponse.data
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
