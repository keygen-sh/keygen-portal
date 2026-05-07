import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/packages")({
  component: () => <Page.App.Packages />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "package.read"),
})
