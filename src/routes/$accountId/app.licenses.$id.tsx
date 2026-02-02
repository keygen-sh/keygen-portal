import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/licenses/$id")({
  component: () => <Page.App.License.Details />,
})
