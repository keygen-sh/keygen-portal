import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { usePlatformTableColumns } from "@/hooks/use-platform-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Platform } from "@/types/platforms"

import { useListPlatforms } from "@/queries/platforms"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function PlatformsList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = usePlatformTableColumns()

  const {
    data: platforms,
    links,
    isLoading: platformsLoading,
  } = useListPlatforms({
    cursor,
    pageSize,
  })

  const nextCursor = cursorFromLink(links?.next)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Platforms" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Platform>
          data={platforms}
          table={table}
          columns={columns}
          pageCount={-1}
          isLoading={platformsLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={platformsLoading}
        />
      </PageFooter>
    </section>
  )
}
