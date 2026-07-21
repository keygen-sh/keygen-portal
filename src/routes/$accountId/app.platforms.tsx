import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"
import { titleHead } from "@/lib/document-title"

export const Route = createFileRoute("/$accountId/app/platforms")({
  head: titleHead("Platforms"),
  component: () => <Page.App.Platforms />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "platform.read"),
})
