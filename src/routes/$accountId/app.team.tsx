import { createFileRoute } from "@tanstack/react-router"
import { type UserFilters } from "@/types/users"
import * as Page from "@/pages/index"
import { requireAllPermissions } from "@/lib/permissions"
import { titleHead } from "@/lib/document-title"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateSearch(search: Record<string, unknown>): UserFilters {
  const filters: UserFilters = {}

  if (typeof search.status === "string") filters.status = search.status
  if (Array.isArray(search.roles)) filters.roles = search.roles as string[]
  if (isRecord(search.metadata))
    filters.metadata = search.metadata as Record<string, string>

  return filters
}

export const Route = createFileRoute("/$accountId/app/team")({
  head: titleHead("Team"),
  component: () => <Page.App.Teams />,
  validateSearch,
  beforeLoad: ({ context }) =>
    requireAllPermissions(context.queryClient, ["admin.read", "user.read"]),
})
