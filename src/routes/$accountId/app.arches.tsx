import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/arches")({
  component: () => <Page.App.Arches />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "arch.read"),
})
