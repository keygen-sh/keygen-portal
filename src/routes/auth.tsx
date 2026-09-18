import { createFileRoute, redirect } from "@tanstack/react-router"

import * as Layout from "@/layouts/index"
import * as keygen from "@/keygen"
import { parseRedirect } from "@/lib/auth"

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: parseRedirect(search.redirect),
  }),
  beforeLoad: ({ search }) => {
    if (keygen.config.hasFixedAccount) {
      redirect({
        to: "/$accountId/auth/login",
        params: { accountId: keygen.config.id },
        search: { redirect: search.redirect },
        replace: true,
        throw: true,
      })
    }
  },
  component: () => <Layout.Auth />,
})
