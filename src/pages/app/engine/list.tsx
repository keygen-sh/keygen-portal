import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { useEngineTableColumns } from "@/hooks/use-engine-table-columns"
import { Engine } from "@/types/engines"

import { useListEngines } from "@/queries/engines"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function EnginesList() {
  const pagination = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = pagination
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

      <DataTable<Engine>
        data={engines}
        pagination={pagination}
        columns={columns}
        isLoading={enginesLoading}
      />

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
