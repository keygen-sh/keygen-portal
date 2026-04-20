import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { APIError } from "@/types/api"
import { Account } from "@/types/accounts"

import * as Schemas from "@/schemas"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const response = await keygen.accounts.get()

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  type MutationValues =
    | Schemas.Account.UpdateValues
    | Schemas.Account.DeveloperValues

  return useMutation<Account, APIError, MutationValues>({
    mutationFn: async (values) => {
      const getResponse = await keygen.accounts.get()

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(current.attributes, values)
      if (Object.keys(changes).length === 0) return current

      const updateResponse = await keygen.accounts.update({
        values: changes,
      })

      if (updateResponse.errors) {
        throw new APIError(updateResponse.errors[0])
      }

      return updateResponse.data
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(["account"], updated)
    },
  })
}

export function useGetAccountPlan(planId?: string) {
  return useQuery({
    queryKey: ["account", "plan", planId],
    queryFn: async () => {
      const response = await keygen.accounts.plan(planId!)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },
    enabled: !!planId,
  })
}

export function useGetAccountBilling(billingId?: string) {
  return useQuery({
    queryKey: ["account", "billing", billingId],
    queryFn: async () => {
      const response = await keygen.accounts.billing()

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },
    enabled: !!billingId,
  })
}

export function useManageSubscription() {
  return useMutation<string, APIError>({
    mutationFn: async () => {
      const response = await keygen.accounts.manageSubscription()

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      const url = response.meta?.url
      if (!url) {
        throw new APIError({
          title: "Request Error",
          detail: "Subscription management session missing URL.",
          code: "CLIENT_ERROR",
        })
      }

      return url
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation<void, APIError>({
    mutationFn: async () => {
      const response = await keygen.accounts.cancelSubscription()

      if (response.errors) {
        throw new APIError(response.errors[0])
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["account", "billing"] })
    },
  })
}

export function useGetAccountSettings() {
  return useQuery({
    queryKey: ["account", "settings"],
    queryFn: async () => {
      const response = await keygen.accounts.settings()

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data ?? []
    },
  })
}

export function useUpdateAccountPermissions() {
  const queryClient = useQueryClient()

  return useMutation<void, APIError, Schemas.Account.PermissionsValues>({
    mutationFn: async (values) => {
      const { defaultUserPermissions, defaultLicensePermissions } = values

      const settingsResponse = await keygen.accounts.settings()
      const existingSettings = settingsResponse.data ?? []

      if (defaultUserPermissions != null) {
        const existing = existingSettings.find(
          (s) => s.attributes.key === "default_user_permissions",
        )

        if (existing && defaultUserPermissions.length === 0) {
          await keygen.accounts.removeSetting({ id: existing.id })
        } else if ((defaultUserPermissions?.length ?? 0) > 0) {
          const response = await keygen.accounts.updateSetting({
            id: existing?.id,
            key: "default_user_permissions",
            value: defaultUserPermissions,
          })

          if (response.errors) {
            throw new APIError(response.errors[0])
          }
        }
      }

      if (defaultLicensePermissions != null) {
        const existing = existingSettings.find(
          (s) => s.attributes.key === "default_license_permissions",
        )

        if (existing && defaultLicensePermissions.length === 0) {
          await keygen.accounts.removeSetting({ id: existing.id })
        } else if ((defaultLicensePermissions?.length ?? 0) > 0) {
          const response = await keygen.accounts.updateSetting({
            id: existing?.id,
            key: "default_license_permissions",
            value: defaultLicensePermissions,
          })

          if (response.errors) {
            throw new APIError(response.errors[0])
          }
        }
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["account", "settings"],
      })
    },
  })
}
