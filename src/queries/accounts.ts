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

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  type MutationValues =
    | Schemas.Account.UpdateValues
    | Schemas.Account.DeveloperValues
    | Schemas.Account.PermissionsValues

  return useMutation<Account, APIError, MutationValues>({
    mutationFn: async (values) => {
      const {
        defaultUserPermissions,
        defaultLicensePermissions,
        ...accountValues
      } = values as Schemas.Account.UpdateValues &
        Schemas.Account.DeveloperValues &
        Schemas.Account.PermissionsValues

      // Update account attributes if any changed
      const getResponse = await keygen.accounts.get()

      if (getResponse.errors) {
        throw new APIError(getResponse.errors[0])
      }

      const current = getResponse.data

      const changes = diff(current.attributes, accountValues)

      let result = current

      if (Object.keys(changes).length > 0) {
        const updateResponse = await keygen.accounts.update({
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        result = updateResponse.data
      }

      // Get existing settings to determine create vs update
      const settingsResponse = await keygen.accounts.settings()
      const existingSettings = settingsResponse.data ?? []

      // Update default user permissions setting
      if (defaultUserPermissions !== undefined) {
        const existing = existingSettings.find(
          (s) => s.attributes.key === "default_user_permissions",
        )
        const settingResponse = await keygen.accounts.updateSetting({
          id: existing?.id,
          key: "default_user_permissions",
          value: defaultUserPermissions,
        })

        if (settingResponse.errors) {
          throw new APIError(settingResponse.errors[0])
        }
      }

      // Update default license permissions setting
      if (defaultLicensePermissions !== undefined) {
        const existing = existingSettings.find(
          (s) => s.attributes.key === "default_license_permissions",
        )
        const settingResponse = await keygen.accounts.updateSetting({
          id: existing?.id,
          key: "default_license_permissions",
          value: defaultLicensePermissions,
        })

        if (settingResponse.errors) {
          throw new APIError(settingResponse.errors[0])
        }
      }

      return result
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(["account"], updated)
      await queryClient.invalidateQueries({
        queryKey: ["account", "settings"],
      })
    },
  })
}
