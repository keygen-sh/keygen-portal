import { useState, useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import * as keygen from "@/keygen"
import { toast } from "@/lib/toast"
import { EnvironmentContext } from "@/contexts/environment-context"

const cache: Record<string, string> = {}

export function EnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [code, setCode] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const getEnvironmentToken = useCallback(async (id: string, code: string) => {
    if (cache[id]) return cache[id]

    keygen.client.setEnvironment(code)

    const response: any = await keygen.client.request(
      `/accounts/${keygen.config.id}/tokens`,
      {
        method: "POST",
        root: true,
        body: JSON.stringify({
          data: {
            type: "tokens",
            relationships: {
              environment: {
                data: { type: "environments", id },
              },
            },
          },
        }),
      },
    )

    const token = response?.data?.attributes?.token as string | undefined
    if (!token) {
      throw new Error("Failed to retrieve environment token")
    }

    cache[id] = token
    return token
  }, [])

  const select = useCallback(
    async (id: string | null, code: string | null) => {
      const previousToken = keygen.client["environmentToken"]
      const previousEnvironment = keygen.client["environment"]

      try {
        if (code === null) {
          keygen.client.setEnvironmentToken(null)
          keygen.client.setEnvironment(null)
        } else {
          const token = await getEnvironmentToken(id!, code)
          keygen.client.setEnvironmentToken(token!)
          keygen.client.setEnvironment(code)
        }

        setCode(code)

        queryClient.invalidateQueries({
          predicate: (q) => q.queryKey[0] !== "environments",
        })
      } catch (e) {
        toast({ message: "Unauthorized", variant: "error" })
        keygen.client.setEnvironmentToken(previousToken!)
        keygen.client.setEnvironment(previousEnvironment!)
        throw e
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
