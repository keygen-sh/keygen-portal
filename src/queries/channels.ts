import { useQuery, keepPreviousData } from "@tanstack/react-query"

import { useEnvironment } from "@/hooks/use-environment"

import { APIError } from "@/types/api"

import * as keygen from "@/keygen"

export function useGetChannel(channelId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["channels", channelId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.channels.get({ id: channelId })

      if (!response.data) {
        throw new Error("Channel not found")
      }

      return response.data
    },
    enabled: !!channelId,
  })
}

export function useListChannels(params?: {
  cursor?: string | null
  pageSize?: number
}) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["channels", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.channels.list(
        params ? { pageCursor: params.cursor, pageSize: params.pageSize } : {},
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
