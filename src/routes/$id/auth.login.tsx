import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/auth/login")({
  component: () => <Page.Auth.Login />,
})
