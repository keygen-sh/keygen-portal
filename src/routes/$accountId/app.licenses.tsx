import { createFileRoute } from "@tanstack/react-router"
import { type LicenseFilters } from "@/queries/licenses"
import * as Page from "@/pages/index"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateSearch(search: Record<string, unknown>): LicenseFilters {
  const filters: LicenseFilters = {}

  if (typeof search.status === "string") filters.status = search.status
  if (typeof search.product === "string") filters.product = search.product
  if (typeof search.policy === "string") filters.policy = search.policy
  if (typeof search.owner === "string") filters.owner = search.owner
  if (typeof search.user === "string") filters.user = search.user
  if (typeof search.group === "string") filters.group = search.group
  if (typeof search.machine === "string") filters.machine = search.machine
  if (typeof search.activated === "boolean")
    filters.activated = search.activated
  if (typeof search.assigned === "boolean") filters.assigned = search.assigned
  if (typeof search.unassigned === "boolean")
    filters.unassigned = search.unassigned
  if (isRecord(search.expires))
    filters.expires = search.expires as Record<string, string>
  if (isRecord(search.expired))
    filters.expired = search.expired as Record<string, string>
  if (isRecord(search.activity))
    filters.activity = search.activity as Record<string, string>
  if (isRecord(search.activations))
    filters.activations = search.activations as Record<string, number>
  if (isRecord(search.metadata))
    filters.metadata = search.metadata as Record<string, string>

  return filters
}

export const Route = createFileRoute("/$accountId/app/licenses")({
  component: () => <Page.App.Licenses />,
  validateSearch,
})
