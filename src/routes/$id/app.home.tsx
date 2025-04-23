import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@pages/index"

export const Route = createFileRoute("/$id/app/home")({
  component: () => <Page.App.Home />,
})
