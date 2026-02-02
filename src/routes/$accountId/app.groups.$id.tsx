import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/groups/$id")({
  component: () => <Page.App.Group.Details />,
})
