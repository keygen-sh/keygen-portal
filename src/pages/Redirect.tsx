import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"

import * as keygen from "@keygen/index"

export default function Redirect() {
  const navigate = useNavigate()
  const user = false // dummy

  useEffect(() => {
    if (user) {
      void navigate({ to: "/$id/app/home", params: { id: keygen.config.id } })
    } else {
      void navigate({ to: "/$id/auth/login", params: { id: keygen.config.id } })
    }
  }, [user, navigate])

  return null
}
