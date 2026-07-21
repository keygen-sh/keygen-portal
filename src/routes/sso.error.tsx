import { createFileRoute } from "@tanstack/react-router"

import { titleHead } from "@/lib/document-title"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/sso/error")({
  validateSearch: (search: Record<string, unknown>): { code?: string } => ({
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  head: titleHead("SSO error"),
  component: () => <Page.Error.SSO />,
})
