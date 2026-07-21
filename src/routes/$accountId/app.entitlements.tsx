import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"
import { titleHead } from "@/lib/document-title"

export const Route = createFileRoute("/$accountId/app/entitlements")({
  head: titleHead("Entitlements"),
  component: () => <Page.App.Entitlements />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "entitlement.read"),
})
