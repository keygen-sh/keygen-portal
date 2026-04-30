import { createContext } from "react"

export interface SessionContextValue {
  user: string | null
  initializing: boolean
  setUser: (id: string | null) => void
}

export const SessionContext = createContext<SessionContextValue>({
  user: null,
  initializing: true,
  setUser: () => {},
})
