import { Navigate } from "@tanstack/react-router"
import { useAuth } from "@/hooks/use-auth"

import * as keygen from "@/keygen/index"

export default function RequireEmail({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = useAuth()

  if (!auth.email) {
    console.warn("No email stored in context. Redirecting to login.")

    return Navigate({ to: "/$id/auth/login", params: { id: keygen.config.id } })
  }

  return <>{children}</>
}
