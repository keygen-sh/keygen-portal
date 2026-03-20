import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/releases")({
  component: () => <Page.App.Releases />,
})
