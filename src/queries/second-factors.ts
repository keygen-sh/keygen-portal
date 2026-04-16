import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { APIError } from "@/types/api"
import { SecondFactor } from "@/types/second-factors"

import * as keygen from "@/keygen"

export function useGetSecondFactor(userId: string | undefined) {
  return useQuery({
    queryKey: ["users", userId, "second-factors"],
    queryFn: async () => {
      const response = await keygen.users.secondFactors.list({
        userId: userId!,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: !!userId,
  })
}

export function useGetCurrentUserSecondFactor() {
  return useQuery({
    queryKey: ["users", "me", "second-factors"],
    queryFn: async () => {
      const meResponse = await keygen.profiles.me()

      if (!meResponse.data) {
        throw new Error("Current user not found")
      }

      const response = await keygen.users.secondFactors.list({
        userId: meResponse.data.id,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
  })
}

export function useCreateSecondFactor() {
  const queryClient = useQueryClient()

  return useMutation<SecondFactor, APIError, { password: string }>({
    mutationFn: async ({ password }) => {
      const meResponse = await keygen.profiles.me()

      if (!meResponse.data) {
        throw new Error("Current user not found")
      }

      const response = await keygen.users.secondFactors.create({
        userId: meResponse.data.id,
        password,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", "me", "second-factors"],
      })
    },
  })
}

export function useEnableSecondFactor() {
  const queryClient = useQueryClient()

  return useMutation<SecondFactor, APIError, { id: string; otp: string }>({
    mutationFn: async ({ id, otp }) => {
      const meResponse = await keygen.profiles.me()

      if (!meResponse.data) {
        throw new Error("Current user not found")
      }

      const response = await keygen.users.secondFactors.update({
        userId: meResponse.data.id,
        id,
        enabled: true,
        otp,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", "me", "second-factors"],
      })
    },
  })
}

export function useDisableSecondFactor() {
  const queryClient = useQueryClient()

  return useMutation<null, APIError, { id: string; otp: string }>({
    mutationFn: async ({ id, otp }) => {
      const meResponse = await keygen.profiles.me()

      if (!meResponse.data) {
        throw new Error("Current user not found")
      }

      const response = await keygen.users.secondFactors.update({
        userId: meResponse.data.id,
        id,
        enabled: false,
        otp,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      await keygen.users.secondFactors.remove({
        userId: meResponse.data.id,
        id,
      })

      return null
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", "me", "second-factors"],
      })
    },
  })
}

export function useDeleteSecondFactor() {
  const queryClient = useQueryClient()

  return useMutation<null, APIError, { id: string }>({
    mutationFn: async ({ id }) => {
      const meResponse = await keygen.profiles.me()

      if (!meResponse.data) {
        throw new Error("Current user not found")
      }

      const response = await keygen.users.secondFactors.remove({
        userId: meResponse.data.id,
        id,
      })

      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", "me", "second-factors"],
      })
    },
  })
}
