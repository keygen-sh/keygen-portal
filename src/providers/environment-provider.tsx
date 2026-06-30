import { useState, useMemo, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { toast } from "@/lib/toast"

import { useEnsureEnvironmentToken } from "@/queries/tokens"
import { EnvironmentContext } from "@/contexts/environment-context"

import * as keygen from "@/keygen"

function CeEnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const value = useMemo(() => ({ code: null, select: async () => {} }), [])
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
  const [code, setCode] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const ensureEnvironmentToken = useEnsureEnvironmentToken()

  const select = useCallback(
    async (environmentId: string | null, environmentCode: string | null) => {
      const previousToken = keygen.client["environmentToken"]
      const previousEnvironment = keygen.client["environment"]

      try {
        if (environmentCode == null) {
          keygen.client.setEnvironmentToken(null)
          keygen.client.setEnvironment(null)
        } else {
          const token = await ensureEnvironmentToken(environmentId!)

          keygen.client.setEnvironmentToken(token)
          keygen.client.setEnvironment(environmentCode)
        }

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
    [ensureEnvironmentToken, queryClient],
  )

  const value = useMemo(() => ({ code, select }), [code, select])

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
