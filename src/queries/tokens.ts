import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Token, CreateTokenVariables } from "@/types/tokens"
import { APIError } from "@/types/api"
import * as keygen from "@/keygen"

export function useCreateToken() {
  const queryClient = useQueryClient()

  return useMutation<Token, APIError, CreateTokenVariables>({
    mutationFn: ({ relationships }) =>
      keygen.tokens
        .create({ relationships })
        .then((response) => response.data as Token),
    onSuccess: (token, variables) => {
      if (variables.cacheKey && token.attributes.token) {
        queryClient.setQueryData<string>(
          variables.cacheKey,
          token.attributes.token,
        )
      }
    },
  })
}

export function useCreateEnvironmentToken() {
  const base = useCreateToken()

  return {
    ...base,
    mutate: ({ environmentId }: { environmentId: string }) =>
      base.mutate({
        relationships: {
          environment: {
            data: { type: "environments", id: environmentId },
          },
        },
        cacheKey: ["token", "environment", environmentId],
      }),
    mutateAsync: ({ environmentId }: { environmentId: string }) =>
      base.mutateAsync({
        relationships: {
          environment: {
            data: { type: "environments", id: environmentId },
          },
        },
        cacheKey: ["token", "environment", environmentId],
      }),
  }
}
