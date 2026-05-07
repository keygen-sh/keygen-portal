import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/artifacts")({
  component: () => <Page.App.Artifacts />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "artifact.read"),
})
