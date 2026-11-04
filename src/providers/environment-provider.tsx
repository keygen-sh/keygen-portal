import { useCallback, useMemo, useState } from "react"

import { toast } from "@/lib/toast"

import { useGetOrCreateEnvironmentToken } from "@/queries/tokens"
import { useActiveEnvironment } from "@/hooks/use-active-environment"
import {
  EnvironmentContext,
  type EnvironmentContextValue,
  type EnvironmentSelection,
} from "@/contexts/environment-context"

import * as keygen from "@/keygen"
import type { RootEnvironment } from "@/keygen/root-environment"

const NO_ENVIRONMENT: EnvironmentContextValue = {
  id: null,
  code: null,
  name: null,
  select: async () => {},
}

function CeEnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <EnvironmentContext.Provider value={NO_ENVIRONMENT}>
      {children}
    </EnvironmentContext.Provider>
  )
}

function ActiveEnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const value = useActiveEnvironment()

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  )
}

function RootEnvironmentProvider({
  environment,
  onRelease,
  children,
}: {
  environment: RootEnvironment
  onRelease: () => void
  children: React.ReactNode
}): React.ReactElement {
  const getToken = useGetOrCreateEnvironmentToken()

  const select = useCallback(
    async (selection: EnvironmentSelection | null) => {
      if (keygen.rootEnvironment.get() != null) return

      try {
        if (selection == null) {
          keygen.activeEnvironment.clear()
        } else {
          const token = await getToken(selection.id)

          keygen.activeEnvironment.set({ ...selection, token })
        }
      } catch (error) {
        toast({ message: "Unauthorized", variant: "error" })

        throw error
      } finally {
        onRelease()
      }
    },
    [getToken, onRelease],
  )

  const value = useMemo<EnvironmentContextValue>(
    () => ({
      id: environment.id,
      code: environment.code ?? environment.id,
      name: environment.name,
      select,
    }),
    [environment, select],
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
  const [root, setRoot] = useState(() => keygen.rootEnvironment.get())
  const release = useCallback(() => setRoot(null), [])

  if (root) {
    return (
      <RootEnvironmentProvider environment={root} onRelease={release}>
        {children}
      </RootEnvironmentProvider>
    )
  }
  return <ActiveEnvironmentProvider>{children}</ActiveEnvironmentProvider>
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
