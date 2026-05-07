import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useArtifactTableColumns } from "@/hooks/use-artifact-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Artifact } from "@/types/artifacts"

import { useListArtifacts, type ArtifactFilters } from "@/queries/artifacts"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Artifacts from "@/components/artifacts"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ArtifactsList() {
  const table = useDataTable()
  const columns = useArtifactTableColumns()

  const [filters, setFilters] = useFilterSearch<ArtifactFilters>()

  const handleFiltersChange = useCallback(
    (next: ArtifactFilters) => {
      setFilters(next)
      table.setPage(1)
    },
    [table, setFilters],
  )

  const {
    data: artifacts,
    links,
    isLoading: artifactsLoading,
  } = useListArtifacts({
    page: table.page,
    pageSize: table.pageSize,
    filters,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Artifacts">
        <Can permission="artifact.create">
          <Button
            size="sm"
            disabled={artifactsLoading}
            onClick={() => setOpen(true)}
          >
            New Artifact
          </Button>
        </Can>
        <Artifacts.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Artifacts.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Artifact>
          data={artifacts}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={artifactsLoading}
          onRowClick={(artifact) => navigateToResource(artifact)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={artifactsLoading}
        />
      </PageFooter>
    </section>
  )
}
