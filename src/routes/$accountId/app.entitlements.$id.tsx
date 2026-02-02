import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/entitlements/$id")({
  component: () => <Page.App.Entitlement.Details />,
})
