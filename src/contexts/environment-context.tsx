import { createContext } from "react"

export interface EnvironmentSelection {
  id: string
  code: string
  name: string
}

export interface EnvironmentContextValue {
  id: string | null
  code: string | null
  name: string | null
  select: (environment: EnvironmentSelection | null) => Promise<void> | void
}

export const EnvironmentContext = createContext<EnvironmentContextValue>({
  id: null,
  code: null,
  name: null,
  select: () => {},
})
