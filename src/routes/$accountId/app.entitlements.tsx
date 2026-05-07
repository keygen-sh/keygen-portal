import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/entitlements")({
  component: () => <Page.App.Entitlements />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "entitlement.read"),
})
