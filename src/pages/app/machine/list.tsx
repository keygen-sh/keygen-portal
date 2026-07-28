import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { useMachineTableColumns } from "@/hooks/use-machine-table-columns"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Machine } from "@/types/machines"

import { useListMachines, type MachineFilters } from "@/queries/machines"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Machines from "@/components/machines"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function MachinesList() {
  const table = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = table
  const columns = useMachineTableColumns()

  const [filters, setFilters] = useFilterSearch<MachineFilters>()

  const {
    data: machines,
    links,
    isLoading: machinesLoading,
  } = useListMachines({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Machines">
        <Can permission="machine.create">
          <Button
            size="sm"
            disabled={machinesLoading}
            onClick={() => setOpen(true)}
          >
            New Machine
          </Button>
        </Can>
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Machines.FilterBar filters={filters} onChange={setFilters} />
      </div>

      <Machines.Form.Create open={open} onOpenChange={setOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Machine>
          data={machines}
          table={table}
          columns={columns}
          isLoading={machinesLoading}
          onRowClick={(machine) => navigateToResource(machine)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={machinesLoading}
        />
      </PageFooter>
    </section>
  )
}
