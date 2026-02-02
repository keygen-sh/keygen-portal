import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/processes/$id")({
  component: () => <Page.App.Process.Details />,
})
