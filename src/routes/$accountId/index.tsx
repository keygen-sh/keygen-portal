import { createFileRoute, redirect } from "@tanstack/react-router"
import * as keygen from "@/keygen"

export const Route = createFileRoute("/$accountId/")({
  loader: () => {
    return redirect({
      to: "/$accountId/app/dashboard",
      params: { accountId: keygen.config.id },
      replace: true,
    })
  },
  component: () => null,
})
