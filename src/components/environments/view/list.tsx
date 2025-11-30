import { useMemo } from "react"

import { createResourceColumnHelper } from "@/lib/tables"
import { Environment } from "@/types/environments"

import { useListEnvironments } from "@/queries/environments"

import DataTable from "@/components/data-table"
import SkeletonTable from "@/components/skeleton-table"

interface EnvironmentsListProps {
  onViewDetails: (environment: Environment) => void
}

export default function EnvironmentsList({
  onViewDetails,
}: EnvironmentsListProps) {
  const { data: environments = [], isLoading } = useListEnvironments()

  const column = createResourceColumnHelper<Environment>()
  const columns = useMemo(
    () => [
      column.id( { header: "ID" }),
      column.attr("name", {
        header: "Name",
      }),
      column.attr("code", {
        header: "Code",
      }),
      column.attr("isolationStrategy", {
        header: "Isolation Strategy",
      }),
    ],
    [],
  )

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
        <SkeletonTable />
      ) : (
        <p className="my-8 text-center text-sm text-content-subdued">
          Looks empty. Create an environment to get started.
        </p>
      )}
    </>
  )
}
