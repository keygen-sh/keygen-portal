import { createContext } from "react"

export interface AuthContextValue {
  email: string | null
  setEmail: (email: string) => void
  password: string | null
  setPassword: (password: string) => void
  error: string | null
  setError: (error: string | null) => void
  clearCredentials: () => void
}

/**
 * Context for storing authentication state.
 */
export const AuthContext = createContext<AuthContextValue>({
  email: null,
  setEmail: () => {},
  password: null,
  setPassword: () => {},
  error: null,
  setError: () => {},
  clearCredentials: () => {},
})
