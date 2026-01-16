import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/app/processes/$processId")({
  component: () => <Page.App.Process.Details />,
})
