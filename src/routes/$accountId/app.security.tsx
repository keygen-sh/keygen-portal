import { createFileRoute } from "@tanstack/react-router"

import { titleHead } from "@/lib/document-title"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/security")({
  head: titleHead("Security"),
  component: () => <Page.App.Settings.Security />,
})
