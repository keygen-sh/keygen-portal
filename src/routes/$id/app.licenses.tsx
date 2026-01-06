import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/app/licenses")({
  component: () => <Page.App.Licenses />,
})
