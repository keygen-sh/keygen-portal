import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@pages/index"

export const Route = createFileRoute("/app/home")({
  component: () => <Page.App.Home />,
})
