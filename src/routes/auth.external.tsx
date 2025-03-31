import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@pages/index"

export const Route = createFileRoute("/auth/external")({
  component: () => <Page.Auth.External />,
})
