import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/webhook-endpoints/$id")({
  component: () => <Page.App.WebhookEndpoint.Details />,
})
