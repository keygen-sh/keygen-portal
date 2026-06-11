import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/lib/permissions"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/webhook-endpoints")({
  component: () => <Page.App.WebhookEndpoints />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "webhook-endpoint.read"),
})
