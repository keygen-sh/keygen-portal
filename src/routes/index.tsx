import { createFileRoute, redirect } from "@tanstack/react-router"
import * as keygen from "@/keygen"

export const Route = createFileRoute("/")({
  loader: () => {
    keygen.config.setAccountId(null)

    if (!keygen.config.id) {
      return redirect({ to: "/auth", replace: true })
    }

    const tokenId =
      localStorage.getItem("tokenId") ?? sessionStorage.getItem("tokenId")

    return redirect({
      to: tokenId ? "/$accountId/app/dashboard" : "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
      replace: true,
    })
  },
  component: () => null,
})
