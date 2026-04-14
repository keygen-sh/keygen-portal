import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { User, type UserFilters } from "@/types/users"

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

export type { UserFilters }

export function useListUsers(
  params?: { page: number; pageSize: number; filters?: UserFilters },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["users", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.users.list(
        params
          ? {
              pageNumber: params.page,
              pageSize: params.pageSize,
              filters: params.filters,
            }
          : {},
      )

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response
    },
    enabled: options?.enabled,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<User, APIError, Schemas.Users.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.users.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: (newUser) => {
      queryClient.setQueryData(
        ["users", { environment: code }],
        (old: User[] | undefined) => {
          if (Array.isArray(old)) return [newUser, ...old]
          return undefined
        },
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

  return useMutation<User, APIError, Schemas.Users.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.users.get({ id: userId })

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(
        {
          ...current.attributes,
          groupId: current.relationships.group?.data?.id ?? null,
        },
        values,
      ) as Schemas.Users.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updateResponse = await keygen.users.update({
        id: userId,
        values: changes,
      })

      if (updateResponse.errors) {
        throw new APIError(updateResponse.errors[0])
      }

      return updateResponse.data
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

export function useChangeUserGroup() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    User,
    APIError,
    { userId: string; groupId: string | null }
  >({
    mutationFn: async ({ userId, groupId }) => {
      const response = await keygen.users.changeGroup({
        id: userId,
        groupId,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["users", updated.id, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["users", { environment: code }],
      })
    },
  })
}

export function useBanUser(userId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<User, APIError>({
    mutationFn: async () => {
      const response = await keygen.users.ban({ id: userId })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
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

export function useUnbanUser(userId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<User, APIError>({
    mutationFn: async () => {
      const response = await keygen.users.unban({ id: userId })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
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

export function useChangePassword() {
  return useMutation<
    User,
    APIError,
    { oldPassword: string; newPassword: string }
  >({
    mutationFn: async ({ oldPassword, newPassword }) => {
      const meResponse = await keygen.profiles.me()

      if (!meResponse.data) {
        throw new Error("Current user not found")
      }

      const response = await keygen.users.changePassword({
        id: meResponse.data.id,
        oldPassword,
        newPassword,
        root: true,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },
  })
}

export function useResetPassword() {
  return useMutation<void, APIError, { email: string }>({
    mutationFn: async ({ email }) => {
      const response = await keygen.users.forgotPassword({ email })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }
    },
  })
}

export function useGetCurrentUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const response = await keygen.profiles.me()

      if (!response.data) {
        throw new Error("Current user not found")
      }

      return response.data
    },
  })
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient()

  return useMutation<User, APIError, Schemas.Users.UpdateValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.profiles.me()

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(
        current.attributes,
        values,
      ) as Schemas.Users.UpdateValues

      if (Object.keys(changes).length === 0) return current

      const updateResponse = await keygen.users.update({
        id: current.id,
        values: changes,
        root: true,
      })

      if (updateResponse.errors) {
        throw new APIError(updateResponse.errors[0])
      }

      return updateResponse.data
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(["users", "me"], updated)
      await queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
