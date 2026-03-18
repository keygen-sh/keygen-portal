import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useMachineTableColumns } from "@/hooks/use-machine-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Machine } from "@/types/machines"

import { useListMachines } from "@/queries/machines"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Machines from "@/components/machines"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function MachinesList() {
  const table = useDataTable()
  const columns = useMachineTableColumns()

  const {
    data: machines,
    links,
    isLoading: machinesLoading,
  } = useListMachines({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Machines">
        <Button
          size="sm"
          disabled={machinesLoading}
          onClick={() => setOpen(true)}
        >
          New Machine
        </Button>
      </PageHeader>

      <Machines.Form.Create open={open} onOpenChange={setOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Machine>
          data={machines}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={machinesLoading}
          onRowClick={(machine) => navigateToResource(machine)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={machinesLoading}
        />
      </PageFooter>
    </section>
  )
}
