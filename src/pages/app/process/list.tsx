import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useProcessTableColumns } from "@/hooks/use-process-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Process } from "@/types/processes"

import { useListProcesses, type ProcessFilters } from "@/queries/processes"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Processes from "@/components/processes"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ProcessesList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const columns = useProcessTableColumns()

  const [filters, setFilters] = useFilterSearch<ProcessFilters>()
  const { cursor, reset, goToPage } = useCursors(page, setPage)

  const handleFiltersChange = useCallback(
    (next: ProcessFilters) => {
      setFilters(next)
      reset()
    },
    [setFilters, reset],
  )

  const {
    data: processes,
    links,
    isLoading: processesLoading,
  } = useListProcesses({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Processes">
        <Can permission="process.create">
          <Button
            size="sm"
            disabled={processesLoading}
            onClick={() => setOpen(true)}
          >
            Spawn Process
          </Button>
        </Can>
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
          pageCount={-1}
          isLoading={processesLoading}
          onRowClick={(process) => navigateToResource(process)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={processesLoading}
        />
      </PageFooter>
    </section>
  )
}
