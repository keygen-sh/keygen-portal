import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useComponentTableColumns } from "@/hooks/use-component-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Component } from "@/types/components"

import { useListComponents, type ComponentFilters } from "@/queries/components"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Components from "@/components/components"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ComponentsList() {
  const table = useDataTable()
  const columns = useComponentTableColumns()

  const [filters, setFilters] = useFilterSearch<ComponentFilters>()

  const handleFiltersChange = useCallback(
    (next: ComponentFilters) => {
      setFilters(next)
      table.setPage(1)
    },
    [table, setFilters],
  )

  const {
    data: components,
    links,
    isLoading: componentsLoading,
  } = useListComponents({
    page: table.page,
    pageSize: table.pageSize,
    filters,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Components">
        <Button
          size="sm"
          disabled={componentsLoading}
          onClick={() => setOpen(true)}
        >
          New Component
        </Button>
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
          pageCount={totalPages}
          isLoading={componentsLoading}
          onRowClick={(component) => navigateToResource(component)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={componentsLoading}
        />
      </PageFooter>
    </section>
  )
}
