import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/auth/sso")({
  component: () => <Page.Auth.SSO />,
})
