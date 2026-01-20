import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/app/users/$userId")({
  component: () => <Page.App.User.Details />,
})
