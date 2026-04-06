import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { APIError } from "@/types/api"
import { SecondFactor } from "@/types/second-factors"

import * as keygen from "@/keygen"

function useBearerId() {
  return localStorage.getItem("bearerId") ?? sessionStorage.getItem("bearerId")
}

export function useListSecondFactors() {
  const bearerId = useBearerId()

  return useQuery({
    queryKey: ["users", bearerId, "second-factors"],
    queryFn: async () => {
      if (!bearerId) throw new Error("No bearer ID found")

      const response = await keygen.users.secondFactors.list({
        userId: bearerId,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
    enabled: !!bearerId,
  })
}

export function useCreateSecondFactor() {
  const queryClient = useQueryClient()
  const bearerId = useBearerId()

  return useMutation<SecondFactor, APIError, { password: string }>({
    mutationFn: async ({ password }) => {
      if (!bearerId) throw new Error("No bearer ID found")

      const response = await keygen.users.secondFactors.create({
        userId: bearerId,
        password,
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", bearerId, "second-factors"],
      })
    },
  })
}

export function useEnableSecondFactor() {
  const queryClient = useQueryClient()
  const bearerId = useBearerId()

  return useMutation<SecondFactor, APIError, { id: string; otp: string }>({
    mutationFn: async ({ id, otp }) => {
      if (!bearerId) throw new Error("No bearer ID found")

      const response = await keygen.users.secondFactors.update({
        userId: bearerId,
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
        queryKey: ["users", bearerId, "second-factors"],
      })
    },
  })
}

export function useDeleteSecondFactor() {
  const queryClient = useQueryClient()
  const bearerId = useBearerId()

  return useMutation<null, APIError, { id: string }>({
    mutationFn: async ({ id }) => {
      if (!bearerId) throw new Error("No bearer ID found")

      const response = await keygen.users.secondFactors.remove({
        userId: bearerId,
        id,
      })

      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", bearerId, "second-factors"],
      })
    },
  })
}
