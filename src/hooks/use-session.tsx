import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import * as keygen from "@/keygen"

const STORAGE_KEYS = ["token", "tokenId"]

export function useSession() {
  const navigate = useNavigate()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    async function verify() {
      const [token, tokenId] = STORAGE_KEYS.map(
        (key) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
      )

      if (!token || !tokenId) {
        keygen.logout()
        return
      }

      try {
        const user = await keygen.verify({ token, tokenId })
        if (!user) throw new Error("User not found")

        keygen.client.setToken(token)

        navigate({
          to: "/$id/app/dashboard",
          params: { id: keygen.config.id },
        })

        return
      } catch (error) {
        console.error(error)
        keygen.logout()
      } finally {
        setInitializing(false)
      }
    }

    verify()
  }, [navigate])

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
