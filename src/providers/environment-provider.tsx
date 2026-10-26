import { useState } from "react"

import { useActiveEnvironment } from "@/hooks/use-active-environment"
import {
  EnvironmentContext,
  type EnvironmentContextValue,
} from "@/contexts/environment-context"

import * as keygen from "@/keygen"

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

function EeEnvironmentProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [root] = useState<EnvironmentContextValue | null>(() => {
    const environment = keygen.rootEnvironment.get()
    if (environment == null) return null

    return {
      id: environment.id,
      code: environment.code ?? environment.id,
      name: environment.name,
      select: async () => {},
    }
  })

  if (root) {
    return (
      <EnvironmentContext.Provider value={root}>
        {children}
      </EnvironmentContext.Provider>
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
