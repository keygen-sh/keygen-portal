import { useState, useMemo, useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { toast } from "@/lib/toast"

import { invalidateScopedQueries } from "@/queries/utils"
import { useGetOrCreateEnvironmentToken } from "@/queries/tokens"

import type {
  EnvironmentContextValue,
  EnvironmentSelection,
} from "@/contexts/environment-context"

import * as keygen from "@/keygen"
import type { ActiveEnvironment } from "@/keygen/environment"

export function useActiveEnvironment(): EnvironmentContextValue {
  const [restored] = useState(() => keygen.environment.restore())
  const [id, setId] = useState<string | null>(restored?.id ?? null)
  const [code, setCode] = useState<string | null>(restored?.code ?? null)
  const [name, setName] = useState<string | null>(restored?.name ?? null)

  const queryClient = useQueryClient()
  const getToken = useGetOrCreateEnvironmentToken()

  const select = useCallback(
    async (environment: EnvironmentSelection | null) => {
      try {
        if (environment == null) {
          keygen.environment.clear()
        } else {
          const token = await getToken(environment.id)

          keygen.environment.set({ ...environment, token })
        }

        setId(environment?.id ?? null)
        setCode(environment?.code ?? null)
        setName(environment?.name ?? null)

        await invalidateScopedQueries(queryClient)
      } catch (error) {
        toast({ message: "Unauthorized", variant: "error" })

        throw error
      }
    },
    [getToken, queryClient],
  )

  // a restored environment may have been deleted or renamed while we were gone,
  // which would scope every request to an environment that no longer resolves
  useEffect(() => {
    if (restored == null) return

    async function revalidate(stored: ActiveEnvironment) {
      const environment = await keygen.environment.resolve(stored)

      if (environment == null) {
        toast({
          message: "Environment unavailable",
          description: "Switched to the global environment.",
          variant: "error",
        })

        return select(null)
      }

      if (
        environment.code === stored.code &&
        environment.name === stored.name
      ) {
        return
      }

      keygen.environment.set(environment)
      setCode(environment.code)
      setName(environment.name)

      await invalidateScopedQueries(queryClient)
    }

    revalidate(restored).catch(console.error)
  }, [restored, select, queryClient])

  return useMemo(() => ({ id, code, name, select }), [id, code, name, select])
}
