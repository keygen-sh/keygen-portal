import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

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

export function useListGroups() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["groups", { environment: code }],
    queryFn: () =>
      keygen.groups.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Group, APIError, Schemas.Groups.CreateValues>({
    mutationFn: (values) =>
      keygen.groups.create(values).then((response) => response.data as Group),

    onSuccess: (newGroup) => {
      queryClient.setQueryData<Group[]>(
        ["groups", { environment: code }],
        (old) => (old ? [newGroup, ...old] : [newGroup]),
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
        const current = response.data as Group

        const changes = diff(
          current.attributes,
          values,
        ) as Schemas.Groups.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.groups
          .update({ id: groupId, values: changes })
          .then((response) => response.data as Group)

        return updated
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
