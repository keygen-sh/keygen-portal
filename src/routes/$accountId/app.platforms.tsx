import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/platforms")({
  component: () => <Page.App.Platforms />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "platform.read"),
})
