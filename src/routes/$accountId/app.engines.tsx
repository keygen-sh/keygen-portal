import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/engines")({
  head: titleHead("Engines"),
  component: () => <Page.App.Engines />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "engine.read"),
})
