import { Navigate } from "@tanstack/react-router"
import { useAuth } from "@hooks/useAuth"

import * as keygen from "@keygen/index"

export default function RequirePassword({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = useAuth()

  if (!auth.password) {
    console.warn("No password stored in context. Redirecting to password.")

    return Navigate({
      to: "/$id/auth/password",
      params: { id: keygen.config.id },
    })
  }

  return <>{children}</>
}
