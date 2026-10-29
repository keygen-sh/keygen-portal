import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { usePlatformTableColumns } from "@/hooks/use-platform-table-columns"
import { Platform } from "@/types/platforms"

import { useListPlatforms } from "@/queries/platforms"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function PlatformsList() {
  const pagination = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = pagination
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

      <DataTable<Platform>
        data={platforms}
        pagination={pagination}
        columns={columns}
        isLoading={platformsLoading}
      />

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
