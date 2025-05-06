import { useContext } from "react"
import { AuthContext } from "@/contexts/auth-context"

/**
 * Custom hook that reads from AuthContext.
 * Provides the current auth state (e.g., user email) and setters.
 *
 * @returns AuthContextValue
 */
export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return value
}
