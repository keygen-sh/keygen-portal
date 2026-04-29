import { useEffect, useState } from "react"
import * as keygen from "@/keygen"

const STORAGE_KEYS = ["token", "tokenId"]

export function useSession() {
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [token, tokenId] = STORAGE_KEYS.map(
        (key) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
      )

      try {
        if (token && tokenId) {
          const { data } = await keygen.verify({ token, tokenId })
          if (data) {
            const userId = data.relationships.bearer?.data?.id
            keygen.client.setRootToken(token)
            keygen.client.setTokenId(tokenId)
            keygen.client.setUser(userId ?? null)
            return
          }
        }

        const meResponse = (await keygen.profiles.me()) as {
          data?: { id: string }
          included?: { type: string; id: string }[]
        }
        if (meResponse.data) {
          const tokenResource = meResponse.included?.find(
            (r) => r.type === "tokens",
          )
          keygen.client.setUser(meResponse.data.id)
          keygen.client.setTokenId(tokenResource?.id ?? null)
          return
        }

        await keygen.logout()
      } catch (error) {
        console.error(error)
        await keygen.logout()
      } finally {
        setInitializing(false)
      }
    })()
  }, [])

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (
        e.storageArea === localStorage &&
        (e.key === "token" || e.key === "tokenId") &&
        e.newValue === null
      ) {
        void keygen.logout()
      }
    }

    function handleSessionExpired() {
      void keygen.logout()
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("keygen:session-expired", handleSessionExpired)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("keygen:session-expired", handleSessionExpired)
    }
  }, [])

  return { initializing }
}
