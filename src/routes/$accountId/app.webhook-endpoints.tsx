import { createFileRoute } from "@tanstack/react-router"

import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/webhook-endpoints")({
  head: titleHead("Webhook Endpoints"),
  component: () => <Page.App.WebhookEndpoints />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "webhook-endpoint.read"),
})
