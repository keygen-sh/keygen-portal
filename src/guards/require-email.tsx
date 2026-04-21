import { Navigate } from "@tanstack/react-router"
import { useAuth } from "@/hooks/use-auth"

import * as keygen from "@/keygen"

export default function RequireEmail({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = useAuth()

  if (!auth.email) {
    console.warn("No email stored in context. Redirecting to login.")

    return Navigate({
      to: "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
    })
  }

  return <>{children}</>
}
