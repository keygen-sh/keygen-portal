import { useQuery } from "@tanstack/react-query"

import { IsolationStrategy } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"
import { useGetOrCreateEnvironmentToken } from "@/queries/tokens"

import * as keygen from "@/keygen"

export interface QuickstartEnvironment {
  id: string
  code: string
  name: string
}

export function useQuickstartEnvironment(options?: { enabled?: boolean }): {
  environment: QuickstartEnvironment | null
  isPending: boolean
} {
  const enabled = options?.enabled ?? true

  const environments = useListEnvironments(undefined, { enabled })
  const shared = environments.data
    .filter(
      (environment) =>
        environment.attributes.isolationStrategy === IsolationStrategy.Shared,
    )
    .sort((a, b) => a.attributes.created.localeCompare(b.attributes.created))
    .at(0)

  const target: QuickstartEnvironment | null = shared
    ? {
        id: shared.id,
        code: shared.attributes.code,
        name: shared.attributes.name,
      }
    : null

  const getToken = useGetOrCreateEnvironmentToken()
  const session = useQuery({
    queryKey: ["quickstart-environment-session", target?.id],
    queryFn: () => getToken(target!.id),
    enabled: enabled && keygen.config.isSessionAuthenticated && target != null,
  })

  if (!enabled) {
    return { environment: null, isPending: false }
  }

  if (environments.isPending) {
    return { environment: null, isPending: true }
  }

  if (target == null) {
    return { environment: null, isPending: false }
  }

  if (keygen.config.isSessionAuthenticated) {
    if (session.isPending) {
      return { environment: null, isPending: true }
    }

    if (session.isError) {
      return { environment: null, isPending: false }
    }
  }

  return { environment: target, isPending: false }
}
