import { createContext } from "react"

export interface AuthContextValue {
  email: string | null
  setEmail: (email: string) => void
}

/**
 * Context for storing authentication state.
 */
export const AuthContext = createContext<AuthContextValue>({
  email: null,
  setEmail: () => {},
})
