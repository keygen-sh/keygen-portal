import { createFileRoute } from "@tanstack/react-router"
import { type ComponentFilters } from "@/queries/components"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"
import { cursorSearch, type CursorSearch } from "@/lib/pagination"
import { titleHead } from "@/lib/document-title"

function validateSearch(
  search: Record<string, unknown>,
): ComponentFilters & CursorSearch {
  const filters: ComponentFilters & CursorSearch = cursorSearch(search)

  if (typeof search.machine === "string") filters.machine = search.machine
  if (typeof search.license === "string") filters.license = search.license
  if (typeof search.owner === "string") filters.owner = search.owner
  if (typeof search.user === "string") filters.user = search.user
  if (typeof search.product === "string") filters.product = search.product

  return filters
}

export const Route = createFileRoute("/$accountId/app/components")({
  head: titleHead("Components"),
  component: () => <Page.App.Components />,
  validateSearch,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "component.read"),
})
