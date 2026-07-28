import { createFileRoute } from "@tanstack/react-router"
import { type ArtifactFilters } from "@/types/artifacts"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"
import { cursorSearch, type CursorSearch } from "@/lib/pagination"
import { titleHead } from "@/lib/document-title"

function validateSearch(
  search: Record<string, unknown>,
): ArtifactFilters & CursorSearch {
  const filters: ArtifactFilters & CursorSearch = cursorSearch(search)

  if (typeof search.status === "string") filters.status = search.status
  if (typeof search.product === "string") filters.product = search.product
  if (typeof search.release === "string") filters.release = search.release
  if (typeof search.channel === "string") filters.channel = search.channel
  if (typeof search.filetype === "string") filters.filetype = search.filetype
  if (typeof search.platform === "string") filters.platform = search.platform
  if (typeof search.arch === "string") filters.arch = search.arch

  return filters
}

export const Route = createFileRoute("/$accountId/app/artifacts")({
  head: titleHead("Artifacts"),
  component: () => <Page.App.Artifacts />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "artifact.read"),
  validateSearch,
})
