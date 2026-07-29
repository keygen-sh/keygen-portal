import { useState, useMemo, useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { toast } from "@/lib/toast"

import { useGetOrCreateEnvironmentToken } from "@/queries/tokens"
import { EnvironmentContext } from "@/contexts/environment-context"
import {
  storeEnvironment,
  clearEnvironment,
  restoreEnvironment,
} from "@/keygen/environment"

import * as Loading from "@/components/loading"

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
  const [restored] = useState(restoreEnvironment)
  const [id, setId] = useState<string | null>(restored?.id ?? null)
  const [code, setCode] = useState<string | null>(restored?.code ?? null)

  // token auth can't scope a request until the environment token is available
  const [restoring, setRestoring] = useState(
    restored != null &&
      keygen.config.isTokenAuthenticated &&
      restored.token == null,
  )

  const queryClient = useQueryClient()
  const getOrCreateEnvironmentToken = useGetOrCreateEnvironmentToken()

  const select = useCallback(
    async (environmentId: string | null, environmentCode: string | null) => {
      const previousToken = keygen.client["environmentToken"]
      const previousEnvironment = keygen.client["environment"]

      try {
        if (environmentCode == null) {
          clearEnvironment()
        } else {
          const token = await getOrCreateEnvironmentToken(environmentId!)

          storeEnvironment({
            id: environmentId!,
            code: environmentCode,
            token,
          })
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

  // a restored environment may have been deleted or renamed while we were gone,
  // which would scope every request to an environment that no longer resolves
  useEffect(() => {
    if (restored == null) return

    let cancelled = false

    void (async () => {
      try {
        const response = await keygen.environments.get({ id: restored.id })
        if (cancelled) return

        const environment = response.data

        if (environment == null) {
          toast({
            message: "Environment unavailable",
            description: "Switched to the global environment.",
            variant: "error",
          })

          await select(null, null)
          return
        }

        const token = keygen.config.isTokenAuthenticated
          ? (restored.token ?? (await getOrCreateEnvironmentToken(restored.id)))
          : null

        if (cancelled) return

        const { code: currentCode } = environment.attributes

        storeEnvironment({ id: restored.id, code: currentCode, token })
        setCode(currentCode)

        if (currentCode !== restored.code) {
          await queryClient.invalidateQueries({
            predicate: (q) => q.queryKey[0] !== "environments",
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setRestoring(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [restored, getOrCreateEnvironmentToken, queryClient, select])

  const value = useMemo(() => ({ id, code, select }), [id, code, select])

  if (restoring) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading.Dots />
      </div>
    )
  }

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
