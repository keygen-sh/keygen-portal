import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { Encoding } from "@/types/files"
import { License, LicenseFile, type LicenseFilters } from "@/types/licenses"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export type { LicenseFilters }

export function useGetLicense(licenseId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["licenses", licenseId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.licenses.get({ id: licenseId })

      if (!response.data) {
        throw new Error("License not found")
      }

      return response.data
    },
    enabled: !!licenseId,
  })
}

export function useListLicenses(
  params?: {
    page: number
    pageSize: number
    filters?: LicenseFilters
  },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["licenses", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.licenses.list(
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

export function useCreateLicense() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<License, APIError, Schemas.Licenses.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.licenses.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newLicense) => {
      queryClient.setQueryData(
        ["licenses", { environment: code }],
        (old: License[] | undefined) => {
          if (Array.isArray(old)) return [newLicense, ...old]
          return undefined
        },
      )
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
    },
  })
}

export function useUpdateLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<License, APIError, Schemas.Licenses.UpdateValues>({
    mutationFn: (values) =>
      keygen.licenses.get({ id: licenseId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values as Partial<typeof current.attributes>,
        ) as Schemas.Licenses.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.licenses.update({
          id: licenseId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["licenses", licenseId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
    },
  })
}

export function useRemoveLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.licenses.remove({ id: licenseId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["licenses", licenseId, { environment: code }],
      })
    },
  })
}

export function useSuspendLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<License, APIError>({
    mutationFn: () =>
      keygen.licenses
        .suspend({ id: licenseId })
        .then((response) => response.data as License),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["licenses", licenseId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
    },
  })
}

export function useReinstateLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<License, APIError>({
    mutationFn: () =>
      keygen.licenses
        .reinstate({ id: licenseId })
        .then((response) => response.data as License),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["licenses", licenseId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
    },
  })
}

export function useRenewLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<License, APIError>({
    mutationFn: () => {
      return keygen.licenses.renew({ id: licenseId }).then((response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        return response.data
      })
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["licenses", licenseId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
    },
  })
}

export function useCheckInLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<License, APIError>({
    mutationFn: () => {
      return keygen.licenses.checkIn({ id: licenseId }).then((response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        return response.data
      })
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["licenses", licenseId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
    },
  })
}

export function useCheckOutLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<LicenseFile, APIError, Schemas.Licenses.CheckOutValues>({
    mutationFn: (values) => {
      const include =
        values.includeEnabled && values.include.length > 0
          ? values.include
          : undefined

      const ttl = values.ttlEnabled && values.ttl ? values.ttl : undefined

      const encoding = values.encryptEnabled
        ? Encoding.Aes256Gcm
        : Encoding.Base64
      const algorithm = `${encoding}+${values.algorithm}`

      return keygen.licenses
        .checkOut({ id: licenseId, include, ttl, algorithm })
        .then((response) => response.data as LicenseFile)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["licenses", licenseId, { environment: code }],
      })
    },
  })
}

export function useResetUsageLicense(licenseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<License, APIError>({
    mutationFn: () =>
      keygen.licenses
        .resetUsage({ id: licenseId })
        .then((response) => response.data as License),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["licenses", licenseId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["licenses", { environment: code }],
      })
    },
  })
}

export function useListLicenseEntitlements(licenseId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["licenses", licenseId, "entitlements", { environment: code }],
    queryFn: () =>
      keygen.licenses
        .listEntitlements({ licenseId })
        .then((response) => response.data ?? []),
    enabled: !!licenseId,
  })
}

export function useAttachLicenseEntitlements() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    null,
    APIError,
    { licenseId: string; entitlementIds: string[] }
  >({
    mutationFn: ({ licenseId, entitlementIds }) =>
      keygen.licenses.attachEntitlements({ licenseId, entitlementIds }),

    onSuccess: async (_, { licenseId }) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "licenses",
          licenseId,
          "entitlements",
          { environment: code },
        ],
      })
      await queryClient.invalidateQueries({
        queryKey: ["licenses", licenseId, { environment: code }],
      })
    },
  })
}

export function useDetachLicenseEntitlements() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    null,
    APIError,
    { licenseId: string; entitlementIds: string[] }
  >({
    mutationFn: ({ licenseId, entitlementIds }) =>
      keygen.licenses.detachEntitlements({ licenseId, entitlementIds }),

    onSuccess: async (_, { licenseId }) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "licenses",
          licenseId,
          "entitlements",
          { environment: code },
        ],
      })
      await queryClient.invalidateQueries({
        queryKey: ["licenses", licenseId, { environment: code }],
      })
    },
  })
}

export function useListLicenseUsers(licenseId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["licenses", licenseId, "users", { environment: code }],
    queryFn: () =>
      keygen.licenses
        .listUsers({ licenseId })
        .then((response) => response.data ?? []),
    enabled: !!licenseId,
  })
}

export function useAttachLicenseUsers() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<null, APIError, { licenseId: string; userIds: string[] }>({
    mutationFn: ({ licenseId, userIds }) =>
      keygen.licenses.attachUsers({ licenseId, userIds }),

    onSuccess: async (_, { licenseId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["licenses", licenseId, "users", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["licenses", licenseId, { environment: code }],
      })
    },
  })
}

export function useDetachLicenseUsers() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<null, APIError, { licenseId: string; userIds: string[] }>({
    mutationFn: ({ licenseId, userIds }) =>
      keygen.licenses.detachUsers({ licenseId, userIds }),

    onSuccess: async (_, { licenseId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["licenses", licenseId, "users", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["licenses", licenseId, { environment: code }],
      })
    },
  })
}
