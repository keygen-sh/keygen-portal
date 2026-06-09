import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/request-logs/$id")({
  component: () => <Page.App.RequestLog.Details />,
})
