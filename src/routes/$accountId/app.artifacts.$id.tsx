import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/artifacts/$id")({
  component: () => <Page.App.Artifact.Details />,
})
