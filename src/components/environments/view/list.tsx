import { useMemo } from "react"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"

import { Environment } from "@/types/environments"

import DataTable from "@/components/data-table"
import SkeletonTable from "@/components/skeleton-table"

interface EnvironmentsListProps {
  data: Environment[]
  fetching: boolean
  onViewDetails: (environment: Environment) => void
}

export default function EnvironmentsList({
  data,
  fetching,
  onViewDetails,
}: EnvironmentsListProps) {
  const column = createColumnHelper<Environment>()
  const columns = useMemo<ColumnDef<Environment, any>[]>(
    () => [
      column.accessor((row) => row.attributes.name, {
        header: "Name",
        id: "attributes.name",
      }),
      column.accessor((row) => row.attributes.code, {
        header: "Code",
        id: "attributes.code",
      }),
      column.accessor((row) => row.attributes.isolationStrategy, {
        header: "Isolation Strategy",
        id: "attributes.isolationStrategy",
      }),
    ],
    [],
  )

  return (
    <>
      {data && data.length > 0 ? (
        <DataTable
          data={data}
          columns={columns}
          onRowClick={onViewDetails}
          hideOnMobile={["attributes.isolationStrategy"]}
        />
      ) : fetching ? (
        <SkeletonTable />
      ) : (
        <p className="my-8 text-center text-sm text-content-subdued">
          Looks empty. Create an environment to get started.
        </p>
      )}
    </>
  )
}
