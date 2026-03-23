import { ScrollArea } from "@/components/ui/scroll-area"

import { useEngineTableColumns } from "@/hooks/use-engine-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Engine } from "@/types/engines"

import { useListEngines } from "@/queries/engines"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function EnginesList() {
  const table = useDataTable()
  const columns = useEngineTableColumns()

  const {
    data: engines,
    links,
    isLoading: enginesLoading,
  } = useListEngines({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Engines" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Engine>
          data={engines}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={enginesLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={enginesLoading}
        />
      </PageFooter>
    </section>
  )
}
