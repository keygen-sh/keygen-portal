import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/app/entitlements")({
  component: () => <Page.App.Entitlements />,
})
