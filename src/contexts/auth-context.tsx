import { createContext } from "react"

export interface AuthContextValue {
  email: string | null
  setEmail: (email: string) => void
  password: string | null
  setPassword: (password: string) => void
  remember: boolean
  setRemember: (remember: boolean) => void
  ssoRedirectUrl: string | null
  setSsoRedirectUrl: (url: string | null) => void
  error: string | null
  setError: (error: string | null) => void
  clearCredentials: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  email: null,
  setEmail: () => {},
  password: null,
  setPassword: () => {},
  remember: false,
  setRemember: () => {},
  ssoRedirectUrl: null,
  setSsoRedirectUrl: () => {},
  error: null,
  setError: () => {},
  clearCredentials: () => {},
})
