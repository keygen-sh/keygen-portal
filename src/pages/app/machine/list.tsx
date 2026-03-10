import { useState } from "react"

import { Button } from "@/components/ui/button"

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

      <DataTable<Machine>
        data={machines}
        table={table}
        columns={columns}
        pageCount={totalPages}
        isLoading={machinesLoading}
        hideOnMobile={[
          "relationships.license",
          "relationships.product",
          "attributes.created",
          "attributes.updated",
        ]}
        onRowClick={(machine) => navigateToResource(machine)}
      />

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={machinesLoading || !table.isMeasured}
        />
      </PageFooter>
    </section>
  )
}
