import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"

export const Route = createFileRoute("/$accountId/auth/reset")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: () => <Auth.Form.ResetPassword />,
})
