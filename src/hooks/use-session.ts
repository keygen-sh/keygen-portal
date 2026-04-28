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
            keygen.client.setUser(userId ?? null)
            return
          }
        }

        const { data: me } = await keygen.profiles.me()
        if (me) {
          keygen.client.setUser(me.id)
          return
        }

        keygen.logout()
      } catch (error) {
        console.error(error)
        keygen.logout()
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
        keygen.logout()
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return { initializing }
}
