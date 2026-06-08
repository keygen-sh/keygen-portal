import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useComponentTableColumns } from "@/hooks/use-component-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Component } from "@/types/components"

import { useListComponents, type ComponentFilters } from "@/queries/components"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Components from "@/components/components"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ComponentsList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const columns = useComponentTableColumns()

  const [filters, setFilters] = useFilterSearch<ComponentFilters>()
  const { cursor, reset, goToPage } = useCursors(page, setPage)

  const handleFiltersChange = useCallback(
    (next: ComponentFilters) => {
      setFilters(next)
      reset()
    },
    [setFilters, reset],
  )

  const {
    data: components,
    links,
    isLoading: componentsLoading,
  } = useListComponents({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Components">
        <Can permission="component.create">
          <Button
            size="sm"
            disabled={componentsLoading}
            onClick={() => setOpen(true)}
          >
            New Component
          </Button>
        </Can>
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Components.FilterBar
          filters={filters}
          onChange={handleFiltersChange}
        />
      </div>

      <Components.Form.Create open={open} onOpenChange={setOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Component>
          data={components}
          table={table}
          columns={columns}
          isLoading={componentsLoading}
          onRowClick={(component) => navigateToResource(component)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={componentsLoading}
        />
      </PageFooter>
    </section>
  )
}
