import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { Encoding } from "@/types/files"
import { Machine, MachineFile } from "@/types/machines"

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

export function useListMachines(params?: { page: number; pageSize: number }) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["machines", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.machines.list(
        params ? { pageNumber: params.page, pageSize: params.pageSize } : {},
      )

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response
    },
    placeholderData: params ? keepPreviousData : undefined,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
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
      const { ownerId, ...rest } = values
      void ownerId

      const getResponse = await keygen.machines.get({ id: machineId })

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(
        {
          ...current.attributes,
          groupId: current.relationships.group?.data?.id ?? null,
        },
        rest,
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

export function useCheckOutMachine(machineId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<MachineFile, APIError, Schemas.Machines.CheckOutValues>({
    mutationFn: (values) => {
      const include =
        values.includeEnabled && values.include.length > 0
          ? values.include
          : undefined

      const ttl = values.ttlEnabled && values.ttl ? values.ttl : undefined

      const encoding = values.encryptEnabled
        ? Encoding.Aes256Gcm
        : Encoding.Base64
      const algorithm = `${encoding}+${values.algorithm}`

      return keygen.machines
        .checkOut({ id: machineId, include, ttl, algorithm })
        .then((response) => response.data as MachineFile)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["machines", machineId, { environment: code }],
      })
    },
  })
}

export function useResetMachineHeartbeat(machineId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Machine, APIError>({
    mutationFn: async () => {
      const response = await keygen.machines.resetHeartbeat({ id: machineId })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
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

export function useChangeMachineOwner() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    Machine,
    APIError,
    { machineId: string; ownerId: string | null }
  >({
    mutationFn: async ({ machineId, ownerId }) => {
      const response = await keygen.machines.changeOwner({
        id: machineId,
        ownerId,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["machines", updated.id, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["machines", { environment: code }],
      })
    },
  })
}

export function useChangeMachineGroup() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    Machine,
    APIError,
    { machineId: string; groupId: string | null }
  >({
    mutationFn: async ({ machineId, groupId }) => {
      const response = await keygen.machines.changeGroup({
        id: machineId,
        groupId,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["machines", updated.id, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["machines", { environment: code }],
      })
    },
  })
}
