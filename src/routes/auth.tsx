import { createFileRoute, redirect } from "@tanstack/react-router"

import * as Layout from "@/layouts/index"
import * as keygen from "@/keygen"

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    if (keygen.config.hasFixedAccount) {
      redirect({
        to: "/$accountId/auth/login",
        params: { accountId: keygen.config.id },
        replace: true,
        throw: true,
      })
    }
  },
  component: () => <Layout.Auth />,
})
