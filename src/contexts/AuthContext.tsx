import { createContext } from "react"

export interface AuthContextValue {
  email: string | null
  setEmail: (email: string) => void
  slug: string | null
  setSlug: (slug: string) => void
}

/**
 * Context for storing authentication state, including values like email and slug.
 */
export const AuthContext = createContext<AuthContextValue>({
  email: null,
  setEmail: () => {},
  slug: null,
  setSlug: () => {},
})
