import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useProcessTableColumns } from "@/hooks/use-process-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Process } from "@/types/processes"

import { useListProcesses } from "@/queries/processes"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Processes from "@/components/processes"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ProcessesList() {
  const table = useDataTable()
  const columns = useProcessTableColumns()

  const {
    data: processes,
    links,
    isLoading: processesLoading,
  } = useListProcesses({
    page: table.page,
    pageSize: table.pageSize,
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

      <Processes.Form.Create open={open} onOpenChange={setOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Process>
          data={processes}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={processesLoading}
          hideOnMobile={[
            "relationships.machine",
            "relationships.license",
            "relationships.product",
            "attributes.created",
            "attributes.updated",
          ]}
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
