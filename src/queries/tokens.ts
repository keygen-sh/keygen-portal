import { useCallback } from "react"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import * as Schemas from "@/schemas"

import { useEnvironment } from "@/hooks/use-environment"

import {
  Token,
  TokenResponse,
  TokenBearerKind,
  type TokenFilters,
  TokenBearerResourceTypes,
} from "@/types/tokens"
import { APIError } from "@/types/api"

import * as keygen from "@/keygen"

export type { TokenFilters }

export function useGetToken(tokenId: string) {
  const { code } = useEnvironment()

  return useQuery({
    queryKey: ["tokens", tokenId, { environment: code }],
    queryFn: async () => {
      const response = await keygen.tokens.get({ id: tokenId })

      if (!response.data) {
        throw new Error("Token not found")
      }

      return response.data
    },
    enabled: !!tokenId,
  })
}

export function useListTokens(
  params?: {
    cursor?: string | null
    pageSize?: number
    filters?: TokenFilters
  },
  options?: { enabled?: boolean },
) {
  const { code } = useEnvironment()

  const query = useQuery({
    queryKey: ["tokens", { environment: code, ...params }],
    queryFn: async () => {
      const response = await keygen.tokens.list(
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
    enabled: options?.enabled,
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    links: query.data?.links,
  }
}

export function useGetOrCreateEnvironmentToken() {
  const queryClient = useQueryClient()

  return useCallback(
    async (environmentId: string): Promise<string> => {
      const cacheKey = ["token", "environment", environmentId]

      const cached = queryClient.getQueryData<string>(cacheKey)
      if (cached) return cached

      const response = await keygen.tokens.create({
        relationships: {
          environment: { data: { type: "environments", id: environmentId } },
        },
      })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      const token = response.data?.attributes.token
      if (!token) {
        throw new Error("Failed to create environment token")
      }

      queryClient.setQueryData(cacheKey, token)
      return token
    },
    [queryClient],
  )
}

export function useCreateToken() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()
  const ensureEnvironmentToken = useGetOrCreateEnvironmentToken()

  return useMutation<Token, APIError, Schemas.Tokens.CreateValues>({
    mutationFn: async (values) => {
      let response: TokenResponse

      if (values.bearerKind === TokenBearerKind.Admin) {
        response = await keygen.tokens.create({ values })
      } else {
        const bearerType = TokenBearerResourceTypes[values.bearerKind]

        if (values.bearerKind === TokenBearerKind.Environment) {
          // environment tokens need to be created within their context,
          // so authenticate with an environment-scoped admin token
          const environmentId = values.bearerId! // required for non-admin bearers
          const environmentToken = await ensureEnvironmentToken(environmentId)

          response = await keygen.tokens.createForBearer({
            values,
            bearerType,
            environment: environmentId,
            environmentToken,
          })
        } else {
          response = await keygen.tokens.createForBearer({ values, bearerType })
        }
      }

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["tokens", { environment: code }],
      })
    },
  })
}

export function useRevokeToken() {
  const queryClient = useQueryClient()
  const { code } = useEnvironment()

  return useMutation<unknown, APIError, { id: string }>({
    mutationFn: ({ id }) => keygen.tokens.revoke({ id }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tokens", { environment: code }],
      })
    },
  })
}

export function useRegenerateToken() {
  const queryClient = useQueryClient()

  return useMutation<Token, APIError, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await keygen.tokens.regenerate({ id })

      if (response.errors) {
        throw new APIError(response.errors[0])
      }

      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tokens"] })
    },
  })
}
