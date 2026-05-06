import { useState, useCallback } from "react"
import { AuthContext } from "@/contexts/auth-context"

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Context provider that manages authentication state.
 * Renders children within the AuthContext.Provider
 */
export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [ssoRedirectUrl, setSsoRedirectUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearCredentials = useCallback(() => {
    setEmail("")
    setPassword("")
    setSsoRedirectUrl(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        email,
        setEmail,
        password,
        setPassword,
        remember,
        setRemember,
        ssoRedirectUrl,
        setSsoRedirectUrl,
        error,
        setError,
        clearCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
