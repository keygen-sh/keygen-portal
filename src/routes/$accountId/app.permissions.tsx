import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/permissions")({
  component: () => <Page.App.Settings.Permissions />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "account.update"),
})
