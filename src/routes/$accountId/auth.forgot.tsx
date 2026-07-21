import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"
import { titleHead } from "@/lib/document-title"

export const Route = createFileRoute("/$accountId/auth/forgot")({
  head: titleHead("Forgot password"),
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: () => <Auth.Form.ForgotPassword />,
})
