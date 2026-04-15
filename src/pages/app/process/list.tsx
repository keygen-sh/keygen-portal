import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useProcessTableColumns } from "@/hooks/use-process-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Process } from "@/types/processes"

import { useListProcesses, type ProcessFilters } from "@/queries/processes"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Processes from "@/components/processes"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ProcessesList() {
  const table = useDataTable()
  const columns = useProcessTableColumns()

  const [filters, setFilters] = useFilterSearch<ProcessFilters>()

  const handleFiltersChange = useCallback(
    (next: ProcessFilters) => {
      setFilters(next)
      table.setPage(1)
    },
    [table, setFilters],
  )

  const {
    data: processes,
    links,
    isLoading: processesLoading,
  } = useListProcesses({
    page: table.page,
    pageSize: table.pageSize,
    filters,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Processes">
        <Button
          size="sm"
          disabled={processesLoading}
          onClick={() => setOpen(true)}
        >
          Spawn Process
        </Button>
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Processes.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <Processes.Form.Create open={open} onOpenChange={setOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Process>
          data={processes}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={processesLoading}
          onRowClick={(process) => navigateToResource(process)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={processesLoading}
        />
      </PageFooter>
    </section>
  )
}
