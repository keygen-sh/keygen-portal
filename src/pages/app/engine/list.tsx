import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
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
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useEngineTableColumns()

  const {
    data: engines,
    links,
    isLoading: enginesLoading,
  } = useListEngines({
    cursor,
    pageSize,
  })

  const nextCursor = cursorFromLink(links?.next)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Engines" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Engine>
          data={engines}
          table={table}
          columns={columns}
          pageCount={-1}
          isLoading={enginesLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={enginesLoading}
        />
      </PageFooter>
    </section>
  )
}
