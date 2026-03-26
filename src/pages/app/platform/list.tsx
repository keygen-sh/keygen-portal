import { ScrollArea } from "@/components/ui/scroll-area"

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
  const columns = usePlatformTableColumns()

  const {
    data: platforms,
    links,
    isLoading: platformsLoading,
  } = useListPlatforms({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Platforms" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Platform>
          data={platforms}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={platformsLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={platformsLoading}
        />
      </PageFooter>
    </section>
  )
}
