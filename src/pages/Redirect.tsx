import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"

import * as keygen from "@/keygen/index"
import { useAuth } from "@/hooks/useAuth"
import * as Loading from "@/components/Loading"

export default function Redirect() {
  const auth = useAuth()
  const navigate = useNavigate()

  const token: string | null =
    localStorage.getItem("token") || sessionStorage.getItem("token")
  const tokenId: string | null =
    localStorage.getItem("tokenId") || sessionStorage.getItem("tokenId")

  const user = tokenId && token ? keygen.verify({ tokenId, token }) : null

  useEffect(() => {
    if (user) {
      if (auth.email || auth.password) {
        auth.clearCredentials()
      }
      void navigate({
        to: "/$id/app/dashboard",
        params: { id: keygen.config.id },
      })
    } else {
      void navigate({ to: "/$id/auth/login", params: { id: keygen.config.id } })
    }
  }, [user, auth, navigate])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loading.Dots />
    </div>
  )
}
