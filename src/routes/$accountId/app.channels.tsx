import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/channels")({
  component: () => <Page.App.Channels />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "channel.read"),
})
