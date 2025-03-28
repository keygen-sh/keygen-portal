import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@pages/index"

export const Route = createFileRoute("/auth/reset")({
  component: () => <Page.Auth.Reset />,
})
