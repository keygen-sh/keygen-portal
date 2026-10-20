import { createFileRoute } from "@tanstack/react-router"
import * as Layout from "@/layouts/index"
import { parseEnvironment, parseRedirect } from "@/lib/auth"

export const Route = createFileRoute("/$accountId/auth")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string; env?: string } => ({
    redirect: parseRedirect(search.redirect),
    env: parseEnvironment(search.env),
  }),
  component: () => <Layout.Auth />,
})
