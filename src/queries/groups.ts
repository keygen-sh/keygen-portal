import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { Group } from "@/types/groups"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetGroup(groupId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["groups", groupId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.groups.get({ id: groupId })

      if (!response.data) {
        throw new Error("Group not found")
      }

      return response.data
    },
    retry: (failures, error) =>
      error.message !== "Group not found" && failures < 3,
    enabled: !!groupId,
  })
}

export function useListGroups(
  params?: { page: number; pageSize: number },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["groups", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.groups.list(
        params ? { pageNumber: params.page, pageSize: params.pageSize } : {},
      )

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response
    },
    placeholderData: params ? keepPreviousData : undefined,
    enabled: options?.enabled,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Group, APIError, Schemas.Groups.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.groups.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: (newGroup) => {
      queryClient.setQueryData(
        ["groups", { environment: code }],
        (old: Group[] | undefined) => {
          if (Array.isArray(old)) return [newGroup, ...old]
          return undefined
        },
      )
      queryClient.setQueryData(
        ["groups", newGroup.id, { environment: code }],
        newGroup,
      )
    },
  })
}

export function useUpdateGroup(groupId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Group, APIError, Schemas.Groups.UpdateValues>({
    mutationFn: (values) =>
      keygen.groups.get({ id: groupId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values,
        ) as Schemas.Groups.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.groups.update({
          id: groupId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["groups", groupId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["groups", { environment: code }],
      })
    },
  })
}

export function useRemoveGroup(groupId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.groups.remove({ id: groupId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groups", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["groups", groupId, { environment: code }],
      })
    },
  })
}
