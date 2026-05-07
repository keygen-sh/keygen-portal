import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/engines")({
  component: () => <Page.App.Engines />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "engine.read"),
})
