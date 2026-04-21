import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"
import { APIError } from "@/types/api"
import { Package, type PackageFilters } from "@/types/packages"

export type { PackageFilters }

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetPackage(packageId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["packages", packageId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.packages.get({ id: packageId })

      if (!response.data) {
        throw new Error("Package not found")
      }

      return response.data
    },
    enabled: !!packageId,
  })
}

export function useListPackages(params?: {
  page: number
  pageSize: number
  filters?: PackageFilters
}) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["packages", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.packages.list(
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
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreatePackage() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Package, APIError, Schemas.Packages.CreateValues>({
    mutationFn: (values) =>
      keygen.packages.create(values).then((response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        return response.data
      }),

    onSuccess: async (newPackage) => {
      queryClient.setQueryData(
        ["packages", newPackage.id, { environment: code }],
        newPackage,
      )
      await queryClient.invalidateQueries({
        queryKey: ["packages", { environment: code }],
      })
    },
  })
}

export function useUpdatePackage(packageId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Package, APIError, Schemas.Packages.UpdateValues>({
    mutationFn: (values) =>
      keygen.packages.get({ id: packageId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values as Partial<typeof current.attributes>,
        ) as Schemas.Packages.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.packages.update({
          id: packageId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["packages", packageId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["packages", { environment: code }],
      })
    },
  })
}

export function useRemovePackage(packageId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.packages.remove({ id: packageId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["packages", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["packages", packageId, { environment: code }],
      })
    },
  })
}
