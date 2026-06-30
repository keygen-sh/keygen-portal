import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/tokens/$id")({
  component: () => <Page.App.Token.Details />,
})
