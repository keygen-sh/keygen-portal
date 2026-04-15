import { createFileRoute } from "@tanstack/react-router"
import { type PolicyFilters } from "@/queries/policies"
import * as Page from "@/pages/index"

function validateSearch(search: Record<string, unknown>): PolicyFilters {
  const filters: PolicyFilters = {}

  if (typeof search.product === "string") filters.product = search.product

  return filters
}

export const Route = createFileRoute("/$accountId/app/policies")({
  component: () => <Page.App.Policies />,
  validateSearch,
})
