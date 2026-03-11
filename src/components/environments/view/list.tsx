import { Environment } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"

import { useEnvironmentTableColumns } from "@/hooks/use-environment-table-columns"
import { useDataTable } from "@/hooks/use-data-table"

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
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  return (
    <div className="flex h-[60vh] flex-col md:h-[40vh]">
      <DataTable
        data={environments}
        table={table}
        columns={columns}
        pageCount={totalPages}
        isLoading={isLoading}
        onRowClick={onViewDetails}
        hideOnMobile={["attributes.isolationStrategy"]}
      />

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={isLoading}
        />
      </PageFooter>
    </div>
  )
}
