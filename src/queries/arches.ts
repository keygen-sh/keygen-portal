import { useQuery, keepPreviousData } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"

import * as keygen from "@/keygen"

export function useGetArch(archId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["arches", archId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.arches.get({ id: archId })

      if (!response.data) {
        throw new Error("Arch not found")
      }

      return response.data
    },
    enabled: !!archId,
  })
}

export function useListArches(
  params?: { page: number; pageSize: number },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["arches", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.arches.list(
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
