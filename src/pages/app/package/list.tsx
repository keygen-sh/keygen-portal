import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { usePackageTableColumns } from "@/hooks/use-package-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Package } from "@/types/packages"

import { useListPackages, type PackageFilters } from "@/queries/packages"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Packages from "@/components/packages"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function PackagesList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const columns = usePackageTableColumns()

  const [filters, setFilters] = useFilterSearch<PackageFilters>()
  const { cursor, reset, goToPage } = useCursors(page, setPage)

  const handleFiltersChange = useCallback(
    (next: PackageFilters) => {
      setFilters(next)
      reset()
    },
    [setFilters, reset],
  )

  const {
    data: packages,
    links,
    isLoading: packagesLoading,
  } = useListPackages({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Packages">
        <Can permission="package.create">
          <Button
            size="sm"
            disabled={packagesLoading}
            onClick={() => setOpen(true)}
          >
            New Package
          </Button>
        </Can>
        <Packages.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Packages.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Package>
          data={packages}
          table={table}
          columns={columns}
          isLoading={packagesLoading}
          onRowClick={(pkg) => navigateToResource(pkg)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={packagesLoading}
        />
      </PageFooter>
    </section>
  )
}
