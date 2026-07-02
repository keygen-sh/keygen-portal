import { createContext } from "react"

export interface EnvironmentContextValue {
  id: string | null
  code: string | null
  select: (id: string | null, code: string | null) => Promise<void> | void
}

export const EnvironmentContext = createContext<EnvironmentContextValue>({
  id: null,
  code: null,
  select: () => {},
})
