import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"
import { titleHead } from "@/lib/document-title"
import { requirePermission } from "@/lib/permissions"
import { TokenBearerType, type TokenFilters } from "@/types/tokens"

function validateSearch(search: Record<string, unknown>): TokenFilters {
  const filters: TokenFilters = {}

  if (
    typeof search.bearerType === "string" &&
    (Object.values(TokenBearerType) as string[]).includes(search.bearerType)
  ) {
    filters.bearerType = search.bearerType as TokenBearerType
  }
  if (typeof search.bearerId === "string") filters.bearerId = search.bearerId
  if (typeof search.environment === "string") {
    filters.environment = search.environment
  }

  return filters
}

export const Route = createFileRoute("/$accountId/app/tokens")({
  head: titleHead("Tokens"),
  component: () => <Page.App.Tokens />,
  validateSearch,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "token.read"),
})
