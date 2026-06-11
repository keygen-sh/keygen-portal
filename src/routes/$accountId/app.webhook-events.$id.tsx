import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/webhook-events/$id")({
  component: () => <Page.App.Event.Details />,
})
