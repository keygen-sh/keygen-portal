import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/groups")({
  component: () => <Page.App.Groups />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "group.read"),
})
