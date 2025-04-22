import { useState } from "react"
import { AuthContext } from "@contexts/AuthContext"

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Context provider that manages authentication state.
 * Renders children within the AuthContext.Provider
 *
 * @param {AuthProviderProps} props - Provider props
 * @param {React.ReactNode} props.children - Components that consume this provider
 * @returns {React.ReactNode} React element that provides authentication state to children
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [email, setEmail] = useState("")
  const [slug, setSlug] = useState("")

  return (
    <AuthContext.Provider value={{ email, setEmail, slug, setSlug }}>
      {children}
    </AuthContext.Provider>
  )
}
