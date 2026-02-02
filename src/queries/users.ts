import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Forms from "@/forms"

import { APIError } from "@/types/api"
import { User } from "@/types/users"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetUser(userId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["users", userId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.users.get({ id: userId })

      if (!response.data) {
        throw new Error("User not found")
      }

      return response.data
    },
    enabled: !!userId,
  })
}

export function useListUsers() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["users", { environment: code }],
    queryFn: () =>
      keygen.users.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<User, APIError, Forms.Users.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.users.create(values)

      if (response.errors && response.errors.length > 0) {
        throw response.errors[0]
      }

      return response.data as User
    },

    onSuccess: (newUser) => {
      queryClient.setQueryData<User[]>(
        ["users", { environment: code }],
        (old) => (old ? [newUser, ...old] : [newUser]),
      )
      queryClient.setQueryData(
        ["users", newUser.id, { environment: code }],
        newUser,
      )
    },
  })
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<User, APIError, Forms.Users.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.users.get({ id: userId })

      if (!getResponse.data) {
        throw new Error("User not found")
      }

      const current = getResponse.data

      const changes = diff(
        {
          ...current.attributes,
          groupId: current.relationships.group?.data?.id ?? null,
        },
        values,
      ) as Forms.Users.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updated = await keygen.users
        .update({
          id: userId,
          values: changes,
        })
        .then((response) => response.data as User)

      return updated
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["users", userId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["users", { environment: code }],
      })
    },
  })
}

export function useRemoveUser(userId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.users.remove({ id: userId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["users", userId, { environment: code }],
      })
    },
  })
}
