import { createFileRoute, redirect } from "@tanstack/react-router"
import * as keygen from "@/keygen"

export const Route = createFileRoute("/")({
  loader: () => {
    if (!keygen.config.id) {
      return redirect({ to: "/auth", replace: true })
    }

    const token =
      localStorage.getItem("token") ?? sessionStorage.getItem("token")

    return redirect({
      to: token ? "/$accountId/app/dashboard" : "/$accountId/auth/login",
      params: { accountId: keygen.config.id },
      replace: true,
    })
  },
  component: () => null,
})
