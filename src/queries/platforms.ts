import { useQuery, keepPreviousData } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"

import * as keygen from "@/keygen"

export function useGetPlatform(platformId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["platforms", platformId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.platforms.get({ id: platformId })

      if (!response.data) {
        throw new Error("Platform not found")
      }

      return response.data
    },
    enabled: !!platformId,
  })
}

export function useListPlatforms(
  params?: { page: number; pageSize: number },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["platforms", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.platforms.list(
        params ? { pageNumber: params.page, pageSize: params.pageSize } : {},
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
