import { Navigate } from "@tanstack/react-router"
import { useAuth } from "@/hooks/use-auth"

import * as keygen from "@/keygen"

export default function RequireSsoRedirect({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = useAuth()

  if (!auth.ssoRedirectUrl) {
    console.warn("No SSO redirect URL stored in context. Redirecting to login.")

    return Navigate({
      to: "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
    })
  }

  return <>{children}</>
}
