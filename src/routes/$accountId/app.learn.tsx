import { createFileRoute } from "@tanstack/react-router"

import { titleHead } from "@/lib/document-title"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/learn")({
  head: titleHead("Learn"),
  component: () => <Page.App.Learn />,
})
