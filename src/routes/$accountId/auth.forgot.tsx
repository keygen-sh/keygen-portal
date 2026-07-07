import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"

export const Route = createFileRoute("/$accountId/auth/forgot")({
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: () => <Auth.Form.ForgotPassword />,
})
