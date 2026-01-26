import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Forms from "@/forms"

import { APIError } from "@/types/api"
import { License } from "@/types/licenses"

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

  return useMutation<License, APIError, Forms.Licenses.CreateValues>({
    mutationFn: (values) =>
      keygen.licenses
        .create(values)
        .then((response) => response.data as License),

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

  return useMutation<License, APIError, Forms.Licenses.UpdateValues>({
    mutationFn: (values) =>
      keygen.licenses.get({ id: licenseId }).then(async (response) => {
        const current = response.data as License

        const changes = diff(
          current.attributes,
          values,
        ) as Forms.Licenses.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updated = await keygen.licenses
          .update({ id: licenseId, values: changes })
          .then((response) => response.data as License)

        return updated
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
