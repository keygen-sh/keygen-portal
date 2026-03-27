import { useQuery } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"

import * as keygen from "@/keygen"

export function useGetEngine(engineId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["engines", engineId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.engines.get({ id: engineId })

      if (!response.data) {
        throw new Error("Engine not found")
      }

      return response.data
    },
    enabled: !!engineId,
  })
}

export function useListEngines(params?: { page: number; pageSize: number }) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["engines", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.engines.list(
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
