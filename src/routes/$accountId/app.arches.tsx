import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/arches")({
  head: titleHead("Architectures"),
  component: () => <Page.App.Arches />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "arch.read"),
})
