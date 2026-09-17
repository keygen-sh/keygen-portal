import { createFileRoute } from "@tanstack/react-router"
import * as Layout from "@/layouts/index"
import { parseRedirect } from "@/lib/auth"

export const Route = createFileRoute("/$accountId/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: parseRedirect(search.redirect),
  }),
  component: () => <Layout.Auth />,
})
