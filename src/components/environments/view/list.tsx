import { Environment } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"

import { useDataTable } from "@/hooks/use-data-table"
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
  const table = useDataTable()
  const columns = useEnvironmentTableColumns()

  const {
    data: environments,
    links,
    isLoading,
  } = useListEnvironments({
    page: table.page,
    pageSize: 15, // Ignore hook value since we're in a dialog
  })

  const totalPages = links?.meta?.pages ?? 1

  return (
    <>
      <DataTable
        data={environments}
        table={table}
        columns={columns}
        pageCount={totalPages}
        isLoading={isLoading}
        onRowClick={onViewDetails}
        hideOnMobile={["attributes.isolationStrategy"]}
      />

      <PageFooter className="border-none">
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={isLoading}
        />
      </PageFooter>
    </>
  )
}
