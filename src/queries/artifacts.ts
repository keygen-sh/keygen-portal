import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import * as Schemas from "@/schemas"
import { APIError } from "@/types/api"
import { Artifact, type ArtifactFilters } from "@/types/artifacts"

import * as keygen from "@/keygen"
import { diff } from "@/lib/utils"

export type { ArtifactFilters }

export function useGetArtifact(artifactId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["artifacts", artifactId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.artifacts.get({ id: artifactId })

      if (!response.data) {
        throw new Error("Artifact not found")
      }

      return response.data
    },
    enabled: !!artifactId,
  })
}

export function useListArtifacts(
  params?: {
    cursor?: string | null
    pageSize?: number
    filters?: ArtifactFilters
  },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["artifacts", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.artifacts.list(
        params
          ? {
              pageCursor: params.cursor,
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
    placeholderData: params ? keepPreviousData : undefined,
    enabled: options?.enabled,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useCreateArtifact() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Artifact, APIError, Schemas.Artifacts.CreateValues>({
    mutationFn: async (values) => {
      const response = await keygen.artifacts.create(values)

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async (newArtifact) => {
      queryClient.setQueryData(
        ["artifacts", newArtifact.id, { environment: code }],
        newArtifact,
      )
      await queryClient.invalidateQueries({
        queryKey: ["artifacts", { environment: code }],
      })
    },
  })
}

export function useUpdateArtifact(artifactId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<Artifact, APIError, Schemas.Artifacts.UpdateValues>({
    mutationFn: (values) =>
      keygen.artifacts.get({ id: artifactId }).then(async (response) => {
        if (response.errors) {
          throw new APIError(response.errors[0])
        }

        const current = response.data

        const changes = diff(
          current.attributes,
          values as Partial<typeof current.attributes>,
        ) as Schemas.Artifacts.UpdateValues
        if (Object.keys(changes).length === 0) return current

        const updateResponse = await keygen.artifacts.update({
          id: artifactId,
          values: changes,
        })

        if (updateResponse.errors) {
          throw new APIError(updateResponse.errors[0])
        }

        return updateResponse.data
      }),

    onSuccess: async (updated) => {
      queryClient.setQueryData(
        ["artifacts", artifactId, { environment: code }],
        updated,
      )
      await queryClient.invalidateQueries({
        queryKey: ["artifacts", { environment: code }],
      })
    },
  })
}

export function useRemoveArtifact(artifactId: string) {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation({
    mutationFn: () => keygen.artifacts.remove({ id: artifactId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["artifacts", { environment: code }],
      })
      queryClient.removeQueries({
        queryKey: ["artifacts", artifactId, { environment: code }],
      })
    },
  })
}
