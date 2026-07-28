import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"
import { titleHead } from "@/lib/document-title"
import { cursorSearch, type CursorSearch } from "@/lib/pagination"
import { requirePermission } from "@/lib/permissions"
import {
  TokenBearerType,
  TokenRole,
  AllTokenRoles,
  type TokenFilters,
} from "@/types/tokens"

function validateSearch(
  search: Record<string, unknown>,
): TokenFilters & CursorSearch {
  const filters: TokenFilters & CursorSearch = cursorSearch(search)

  if (
    typeof search.bearerType === "string" &&
    (Object.values(TokenBearerType) as string[]).includes(search.bearerType)
  ) {
    filters.bearerType = search.bearerType as TokenBearerType
  }
  if (typeof search.bearerId === "string") filters.bearerId = search.bearerId
  if (Array.isArray(search.bearerRoles)) {
    const bearerRoles = search.bearerRoles.filter(
      (role): role is TokenRole =>
        typeof role === "string" &&
        (AllTokenRoles as readonly string[]).includes(role),
    )
    if (bearerRoles.length > 0) filters.bearerRoles = bearerRoles
  }
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
