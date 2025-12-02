import { Environment } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"

import { useEnvironmentTableColumns } from "@/hooks/use-environment-table-columns"

import DataTable from "@/components/data-table"
import * as Skeletons from "@/components/skeletons"

interface EnvironmentsListProps {
  onViewDetails: (environment: Environment) => void
}

export default function EnvironmentsList({
  onViewDetails,
}: EnvironmentsListProps) {
  const { data: environments = [], isLoading } = useListEnvironments()
  const columns = useEnvironmentTableColumns()

  return (
    <>
      {environments && environments.length > 0 ? (
        <DataTable
          data={environments}
          columns={columns}
          onRowClick={onViewDetails}
          hideOnMobile={["attributes.isolationStrategy"]}
          includePagination={false}
        />
      ) : isLoading ? (
        <Skeletons.Table />
      ) : (
        <p className="my-8 text-center text-sm text-content-subdued">
          Looks empty. Create an environment to get started.
        </p>
      )}
    </>
  )
}
