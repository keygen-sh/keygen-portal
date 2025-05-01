import { useState, useCallback } from "react"
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
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const clearCredentials = useCallback(() => {
    setEmail("")
    setPassword("")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        email,
        setEmail,
        password,
        setPassword,
        error,
        setError,
        clearCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
