import { useState, useMemo, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { EnvironmentContext } from "@/contexts/environment-context"
import { useCreateEnvironmentToken } from "@/queries/tokens"

import * as keygen from "@/keygen"
import { toast } from "@/lib/toast"

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [code, setCode] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync: createEnvironmentToken } = useCreateEnvironmentToken()

  const getEnvironmentToken = useCallback(
    async (environmentId: string): Promise<string> => {
      const cacheKey = ["token", "environment", environmentId]

      const cached = queryClient.getQueryData<string>(cacheKey)
      if (cached) return cached

      const tokenResource = await createEnvironmentToken({
        environmentId: environmentId,
      })
      return tokenResource.attributes.token!
    },
    [createEnvironmentToken, queryClient],
  )

  const select = useCallback(
    async (environmentId: string | null, environmentCode: string | null) => {
      const previousToken = keygen.client["environmentToken"]
      const previousEnvironment = keygen.client["environment"]

      try {
        if (environmentCode == null) {
          keygen.client.setEnvironmentToken(null)
          keygen.client.setEnvironment(null)
        } else {
          const token = await getEnvironmentToken(environmentId!)

          keygen.client.setEnvironmentToken(token)
          keygen.client.setEnvironment(environmentCode)
        }

        setCode(environmentCode)
        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] !== "environments",
        })
      } catch (error) {
        toast({ message: "Unauthorized", variant: "error" })
        keygen.client.setEnvironmentToken(previousToken ?? null)
        keygen.client.setEnvironment(previousEnvironment ?? null)
        throw error
      }
    },
    [getEnvironmentToken, queryClient],
  )

  const value = useMemo(() => ({ code, select }), [code, select])

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  )
}
