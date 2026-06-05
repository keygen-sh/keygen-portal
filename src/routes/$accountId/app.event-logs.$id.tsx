import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/event-logs/$id")({
  component: () => <Page.App.EventLog.Details />,
})
