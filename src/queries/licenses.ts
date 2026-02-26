import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"

import { APIError } from "@/types/api"
import { License, LicenseFile } from "@/types/licenses"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

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

export function useListLicenses() {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["licenses", { environment: code }],
    queryFn: () =>
      keygen.licenses.list({}).then((response) => response.data ?? []),
  })
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

    onSuccess: (newLicense) => {
      queryClient.setQueryData<License[]>(
        ["licenses", { environment: code }],
        (old) => (old ? [newLicense, ...old] : [newLicense]),
      )
      queryClient.setQueryData(
        ["licenses", newLicense.id, { environment: code }],
        newLicense,
      )
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
          values,
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

      const prefix = values.encryptEnabled ? "aes-256-gcm" : "base64"
      const algorithm = `${prefix}+${values.algorithm}`

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
