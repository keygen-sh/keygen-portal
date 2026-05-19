import { createFileRoute } from "@tanstack/react-router"
import { type ReleaseFilters } from "@/types/releases"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

function validateSearch(search: Record<string, unknown>): ReleaseFilters {
  const filters: ReleaseFilters = {}

  if (typeof search.status === "string") filters.status = search.status
  if (typeof search.channel === "string") filters.channel = search.channel
  if (typeof search.product === "string") filters.product = search.product
  if (typeof search.package === "string") filters.package = search.package
  if (typeof search.engine === "string") filters.engine = search.engine
  if (Array.isArray(search.entitlements))
    filters.entitlements = search.entitlements as string[]

  return filters
}

export const Route = createFileRoute("/$accountId/app/releases")({
  component: () => <Page.App.Releases />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "release.read"),
  validateSearch,
})
