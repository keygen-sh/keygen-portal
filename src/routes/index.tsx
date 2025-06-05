import { createFileRoute, redirect } from "@tanstack/react-router"
import * as keygen from "@/keygen"

export const Route = createFileRoute("/")({
  loader: () => {
    const token =
      localStorage.getItem("token") ?? sessionStorage.getItem("token")

    return redirect({
      to: token ? "/$id/app/dashboard" : "/$id/auth/login",
      params: { id: keygen.config.id },
      replace: true,
    })
  },
  component: () => null,
})
