import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/releases")({
  component: () => <Page.App.Releases />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "release.read"),
})
