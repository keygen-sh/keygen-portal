import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import * as keygen from "@/keygen"
import { SessionContext } from "@/contexts/session-context"
import { restoreSession } from "@/keygen/session"

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({
  children,
}: SessionProviderProps): React.ReactElement {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [user, setUserState] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Sync to client for API headers
  const setUser = useCallback((id: string | null) => {
    keygen.client.setUser(id)
    setUserState(id)
  }, [])

  const logoutAndRedirect = useCallback(async () => {
    await keygen.logout()
    setUser(null)
    queryClient.clear()
    void navigate({
      to: "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
      replace: true,
    })
  }, [setUser, queryClient, navigate])

  // Establish session state
  useEffect(() => {
    ;(async () => {
      try {
        const { userId } = await restoreSession()

        setUser(userId)
      } catch (error) {
        console.error(error)
      } finally {
        setInitializing(false)
      }
    })()
  }, [setUser])

  // Sync logout when another tab clears the token for multitab cases
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (
        e.storageArea === localStorage &&
        (e.key === "token" || e.key === "tokenId") &&
        e.newValue === null
      ) {
        void logoutAndRedirect()
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [logoutAndRedirect])

  // Logout on server-side session expiry
  useEffect(() => {
    function handleSessionExpired() {
      void logoutAndRedirect()
    }
    window.addEventListener("keygen:session-expired", handleSessionExpired)
    return () =>
      window.removeEventListener("keygen:session-expired", handleSessionExpired)
  }, [logoutAndRedirect])

  return (
    <SessionContext.Provider value={{ user, initializing, setUser }}>
      {children}
    </SessionContext.Provider>
  )
}
