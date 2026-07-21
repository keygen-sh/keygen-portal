import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"
import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/developers")({
  head: titleHead("Developers"),
  component: () => <Page.App.Settings.Developers />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "token.read"),
})
