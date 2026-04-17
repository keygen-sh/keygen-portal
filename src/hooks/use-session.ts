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

      if (!token || !tokenId) {
        keygen.logout()
        return
      }

      try {
        const { data } = await keygen.verify({ token, tokenId })
        if (!data) throw new Error("User not found")

        const userId = data.relationships.bearer?.data?.id

        keygen.client.setRootToken(token)
        keygen.client.setUser(userId ?? null)

        return
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
