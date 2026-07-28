import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { useArchTableColumns } from "@/hooks/use-arch-table-columns"
import { Arch } from "@/types/arches"

import { useListArches } from "@/queries/arches"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ArchesList() {
  const pagination = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = pagination
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
          pagination={pagination}
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
