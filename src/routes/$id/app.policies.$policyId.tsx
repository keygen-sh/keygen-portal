import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/app/policies/$policyId")({
  component: () => <Page.App.Policy.Details />,
})
