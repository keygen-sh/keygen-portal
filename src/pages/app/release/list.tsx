import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { useReleaseTableColumns } from "@/hooks/use-release-table-columns"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Release } from "@/types/releases"

import { useListReleases, type ReleaseFilters } from "@/queries/releases"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Releases from "@/components/releases"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ReleasesList() {
  const pagination = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = pagination
  const columns = useReleaseTableColumns()

  const [filters, setFilters] = useFilterSearch<ReleaseFilters>()

  const {
    data: releases,
    links,
    isLoading: releasesLoading,
  } = useListReleases({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Releases">
        <Can permission="release.create">
          <Button
            size="sm"
            disabled={releasesLoading}
            onClick={() => setOpen(true)}
          >
            New Release
          </Button>
        </Can>
        <Releases.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Releases.FilterBar filters={filters} onChange={setFilters} />
      </div>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Release>
          data={releases}
          pagination={pagination}
          columns={columns}
          isLoading={releasesLoading}
          onRowClick={(release) => navigateToResource(release)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={releasesLoading}
        />
      </PageFooter>
    </section>
  )
}
