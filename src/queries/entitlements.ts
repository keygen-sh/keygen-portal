import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Forms from "@/forms"

import { APIError } from "@/types/api"
import { Entitlement } from "@/types/entitlements"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetEntitlement(entitlementId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["entitlements", entitlementId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.entitlements.get({ id: entitlementId })

      if (!response.data) {
        throw new Error("Entitlement not found")
      }

      return response.data
    },
    retry: (failures, error) =>
      error.message !== "Entitlement not found" && failures < 3,
  })
}

export function useListEntitlements() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["entitlements", { environment: code }],
    queryFn: () =>
      keygen.entitlements.list({}).then((response) => response.data ?? []),
  })
}

export function useCreateEntitlement() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Entitlement, APIError, Forms.Entitlements.CreatePayload>({
    mutationFn: async (payload) => {
      const response = await keygen.entitlements.create(payload)

      if (response.errors && response.errors.length > 0) {
        throw response.errors[0]
      }

      return response?.data as Entitlement
    },

    onSuccess: (newEntitlement) => {
      if (!newEntitlement || !newEntitlement.id) return

      queryClient.setQueryData<Entitlement[]>(
        ["entitlements", { environment: code }],
        (old) => (old ? [newEntitlement, ...old] : [newEntitlement]),
      )
      queryClient.setQueryData(
        ["entitlements", newEntitlement.id, { environment: code }],
        newEntitlement,
      )
    },
  })
}

export function useUpdateEntitlement(entitlementId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Entitlement, APIError, Forms.Entitlements.UpdatePayload>({
    mutationFn: (values) =>
      keygen.entitlements.get({ id: entitlementId }).then(async (response) => {
        const current = response.data as Entitlement

        const changes = diff(
          current.attributes,
          values,
        ) as Forms.Entitlements.UpdatePayload
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.entitlements
          .update({ id: entitlementId, ...changes })
          .then((response) => response.data as Entitlement)

        return updated
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["entitlements", entitlementId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["entitlements", { environment: code }],
      })
    },
  })
}

export function useRemoveEntitlement(entitlementId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.entitlements.remove({ id: entitlementId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["entitlements", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["entitlements", entitlementId, { environment: code }],
      })
    },
  })
}
