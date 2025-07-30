import { createContext } from "react"

export interface EnvironmentContextValue {
  code: string | null
  select: (id: string | null, code: string | null) => Promise<void> | void
}

export const EnvironmentContext = createContext<EnvironmentContextValue>({
  code: null,
  select: () => {},
})
