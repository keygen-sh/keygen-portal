import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/groups")({
  head: titleHead("Groups"),
  component: () => <Page.App.Groups />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "group.read"),
})
