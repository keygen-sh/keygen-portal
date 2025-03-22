import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@pages/index"

export const Route = createFileRoute("/auth/verify")({
  component: () => <Page.Auth.Verify />,
})
