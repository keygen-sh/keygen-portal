import { useState, useMemo, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { toast } from "@/lib/toast"

import { useGetOrCreateEnvironmentToken } from "@/queries/tokens"
import { EnvironmentContext } from "@/contexts/environment-context"

import * as keygen from "@/keygen"

function CeEnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const value = useMemo(
    () => ({ id: null, code: null, select: async () => {} }),
    [],
  )
  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  )
}

function EeEnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [id, setId] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const getOrCreateEnvironmentToken = useGetOrCreateEnvironmentToken()

  const select = useCallback(
    async (environmentId: string | null, environmentCode: string | null) => {
      const previousToken = keygen.client["environmentToken"]
      const previousEnvironment = keygen.client["environment"]

      try {
        if (environmentCode == null) {
          keygen.client.setEnvironmentToken(null)
          keygen.client.setEnvironment(null)
        } else {
          const token = await getOrCreateEnvironmentToken(environmentId!)

          keygen.client.setEnvironmentToken(token)
          keygen.client.setEnvironment(environmentCode)
        }

        setId(environmentId)
        setCode(environmentCode)
        await queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] !== "environments",
        })
      } catch (error) {
        toast({ message: "Unauthorized", variant: "error" })
        keygen.client.setEnvironmentToken(previousToken ?? null)
        keygen.client.setEnvironment(previousEnvironment ?? null)
        throw error
      }
    },
    [getOrCreateEnvironmentToken, queryClient],
  )

  const value = useMemo(() => ({ id, code, select }), [id, code, select])

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  )
}

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  if (keygen.config.isCE) {
    return <CeEnvironmentProvider>{children}</CeEnvironmentProvider>
  }
  return <EeEnvironmentProvider>{children}</EeEnvironmentProvider>
}
