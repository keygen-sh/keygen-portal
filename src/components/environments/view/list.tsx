import { Environment } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { usePagination } from "@/hooks/use-pagination"
import { useEnvironmentTableColumns } from "@/hooks/use-environment-table-columns"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageFooter from "@/components/page-footer"

interface EnvironmentsListProps {
  onViewDetails: (environment: Environment) => void
}

export default function EnvironmentsList({
  onViewDetails,
}: EnvironmentsListProps) {
  const pagination = usePagination()
  const { page, setPage } = pagination
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useEnvironmentTableColumns()

  const {
    data: environments,
    links,
    isLoading,
  } = useListEnvironments({
    cursor,
    pageSize: 15, // Ignore hook value since we're in a dialog
  })

  const nextCursor = cursorFromLink(links?.next)

  return (
    <>
      <DataTable
        data={environments}
        pagination={pagination}
        columns={columns}
        isLoading={isLoading}
        onRowClick={onViewDetails}
      />

      <PageFooter className="border-none">
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={isLoading}
        />
      </PageFooter>
    </>
  )
}
