import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useLicenseTableColumns } from "@/hooks/use-license-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { License } from "@/types/licenses"

import { useListLicenses, type LicenseFilters } from "@/queries/licenses"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Licenses from "@/components/licenses"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LicensesList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const columns = useLicenseTableColumns()

  const [filters, setFilters] = useFilterSearch<LicenseFilters>()
  const { cursor, reset, goToPage } = useCursors(page, setPage)

  const handleFiltersChange = useCallback(
    (next: LicenseFilters) => {
      setFilters(next)
      reset()
    },
    [setFilters, reset],
  )

  const {
    data: licenses,
    links,
    isLoading: licensesLoading,
  } = useListLicenses({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Licenses">
        <Can permission="license.create">
          <Button
            size="sm"
            disabled={licensesLoading}
            onClick={() => setOpen(true)}
          >
            New License
          </Button>
        </Can>
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Licenses.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <Licenses.Form.Create open={open} onOpenChange={setOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<License>
          data={licenses}
          table={table}
          columns={columns}
          pageCount={-1}
          isLoading={licensesLoading}
          onRowClick={(license) => navigateToResource(license)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={licensesLoading}
        />
      </PageFooter>
    </section>
  )
}
