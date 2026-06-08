import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useArchTableColumns } from "@/hooks/use-arch-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Arch } from "@/types/arches"

import { useListArches } from "@/queries/arches"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ArchesList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useArchTableColumns()

  const {
    data: arches,
    links,
    isLoading: archesLoading,
  } = useListArches({
    cursor,
    pageSize,
  })

  const nextCursor = cursorFromLink(links?.next)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Architectures" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Arch>
          data={arches}
          table={table}
          columns={columns}
          isLoading={archesLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={archesLoading}
        />
      </PageFooter>
    </section>
  )
}
