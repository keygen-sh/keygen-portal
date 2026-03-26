import { ScrollArea } from "@/components/ui/scroll-area"

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
  const columns = useArchTableColumns()

  const {
    data: arches,
    links,
    isLoading: archesLoading,
  } = useListArches({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Architectures" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Arch>
          data={arches}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={archesLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={archesLoading}
        />
      </PageFooter>
    </section>
  )
}
