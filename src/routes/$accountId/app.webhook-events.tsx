import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/lib/permissions"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/webhook-events")({
  component: () => <Page.App.Events />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "webhook-event.read"),
})
