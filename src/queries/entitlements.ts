import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

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
    enabled: !!entitlementId,
  })
}

export function useListEntitlements(params?: {
  page: number
  pageSize: number
}) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["entitlements", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.entitlements.list(
        params ? { pageNumber: params.page, pageSize: params.pageSize } : {},
      )

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response
    },
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreateEntitlement() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Entitlement, APIError, Schemas.Entitlements.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.entitlements.create({ values })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newEntitlement) => {
      if (!newEntitlement || !newEntitlement.id) return

      queryClient.setQueryData(
        ["entitlements", newEntitlement.id, { environment: code }],
        newEntitlement,
      )
      await queryClient.invalidateQueries({
        queryKey: ["entitlements", { environment: code }],
      })
    },
  })
}

export function useUpdateEntitlement(entitlementId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Entitlement, APIError, Schemas.Entitlements.UpdateValues>({
    mutationFn: (values) =>
      keygen.entitlements.get({ id: entitlementId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values,
        ) as Schemas.Entitlements.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.entitlements.update({
          id: entitlementId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
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
