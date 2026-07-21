import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"
import { titleHead } from "@/lib/document-title"

export const Route = createFileRoute("/$accountId/auth/reset")({
  head: titleHead("Reset password"),
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: () => <Auth.Form.ResetPassword />,
})
