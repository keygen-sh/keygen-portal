import { createFileRoute } from "@tanstack/react-router"
import { type ComponentFilters } from "@/queries/components"
import * as Page from "@/pages/index"

function validateSearch(search: Record<string, unknown>): ComponentFilters {
  const filters: ComponentFilters = {}

  if (typeof search.machine === "string") filters.machine = search.machine
  if (typeof search.license === "string") filters.license = search.license
  if (typeof search.owner === "string") filters.owner = search.owner
  if (typeof search.user === "string") filters.user = search.user
  if (typeof search.product === "string") filters.product = search.product

  return filters
}

export const Route = createFileRoute("/$accountId/app/components")({
  component: () => <Page.App.Components />,
  validateSearch,
})
