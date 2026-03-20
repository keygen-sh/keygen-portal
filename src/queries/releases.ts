import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"
import { APIError } from "@/types/api"
import { Release } from "@/types/releases"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export function useGetRelease(releaseId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["releases", releaseId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.releases.get({ id: releaseId })

      if (!response.data) {
        throw new Error("Release not found")
      }

      return response.data
    },
    enabled: !!releaseId,
  })
}

export function useListReleases(params?: { page: number; pageSize: number }) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["releases", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.releases.list(
        params ? { pageNumber: params.page, pageSize: params.pageSize } : {},
      )

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response
    },
    placeholderData: params ? keepPreviousData : undefined,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreateRelease() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Release, APIError, Schemas.Releases.CreateValues>({
    mutationFn: (values) =>
      keygen.releases.create(values).then((response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        return response.data
      }),

    onSuccess: (newRelease) => {
      queryClient.setQueryData(
        ["releases", { environment: code }],
        (old: Release[] | undefined) => {
          if (Array.isArray(old)) return [newRelease, ...old]
          return undefined
        },
      )
      queryClient.setQueryData(
        ["releases", newRelease.id, { environment: code }],
        newRelease,
      )
    },
  })
}

export function useUpdateRelease(releaseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Release, APIError, Schemas.Releases.UpdateValues>({
    mutationFn: (values) =>
      keygen.releases.get({ id: releaseId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values as Partial<typeof current.attributes>,
        ) as Schemas.Releases.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.releases.update({
          id: releaseId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["releases", releaseId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["releases", { environment: code }],
      })
    },
  })
}

export function useRemoveRelease(releaseId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.releases.remove({ id: releaseId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["releases", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["releases", releaseId, { environment: code }],
      })
    },
  })
}

export function useListReleaseConstraints(releaseId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["releases", releaseId, "constraints", { environment: code }],
    queryFn: () =>
      keygen.releases
        .listConstraints({ releaseId })
        .then((response) => response.data ?? []),
    enabled: !!releaseId,
  })
}

export function useAttachReleaseConstraints() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    null,
    APIError,
    { releaseId: string; entitlementIds: string[] }
  >({
    mutationFn: ({ releaseId, entitlementIds }) =>
      keygen.releases.attachConstraints({ releaseId, entitlementIds }),

    onSuccess: async (_, { releaseId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["releases", releaseId, "constraints", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["releases", releaseId, { environment: code }],
      })
    },
  })
}

export function useDetachReleaseConstraints() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<
    null,
    APIError,
    { releaseId: string; constraintIds: string[] }
  >({
    mutationFn: ({ releaseId, constraintIds }) =>
      keygen.releases.detachConstraints({ releaseId, constraintIds }),

    onSuccess: async (_, { releaseId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["releases", releaseId, "constraints", { environment: code }],
      })
      await queryClient.invalidateQueries({
        queryKey: ["releases", releaseId, { environment: code }],
      })
    },
  })
}
