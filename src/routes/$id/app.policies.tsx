import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/app/policies")({
  component: () => <Page.App.Policies />,
})
