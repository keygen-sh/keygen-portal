import { createFileRoute } from "@tanstack/react-router"

import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/webhook-events")({
  head: titleHead("Webhook Events"),
  component: () => <Page.App.WebhookEvents />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "webhook-event.read"),
})
