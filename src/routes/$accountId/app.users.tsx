import { createFileRoute } from "@tanstack/react-router"
import { type UserFilters } from "@/queries/users"
import * as Page from "@/pages/index"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateSearch(search: Record<string, unknown>): UserFilters {
  const filters: UserFilters = {}

  if (typeof search.status === "string") filters.status = search.status
  if (typeof search.assigned === "boolean") filters.assigned = search.assigned
  if (typeof search.product === "string") filters.product = search.product
  if (typeof search.group === "string") filters.group = search.group
  if (Array.isArray(search.roles)) filters.roles = search.roles as string[]
  else filters.roles = ["user"]
  if (isRecord(search.metadata))
    filters.metadata = search.metadata as Record<string, string>

  return filters
}

export const Route = createFileRoute("/$accountId/app/users")({
  component: () => <Page.App.Users />,
  validateSearch,
})
