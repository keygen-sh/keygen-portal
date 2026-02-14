import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useProcessTableColumns } from "@/hooks/use-process-table-columns"

import { Process } from "@/types/processes"
import { useListProcesses } from "@/queries/processes"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Processes from "@/components/processes"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function ProcessesList() {
  const { data: processes = [], isLoading: processesLoading } =
    useListProcesses()
  const columns = useProcessTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section>
      <PageHeader title="Processes">
        <Button
          size="sm"
          disabled={processesLoading}
          onClick={() => setOpen(true)}
        >
          Spawn Process
        </Button>
      </PageHeader>

      <Processes.Form.Create open={open} onOpenChange={setOpen} />

      {processesLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Process>
          data={processes}
          columns={columns}
          hideOnMobile={[
            "relationships.machine",
            "relationships.license",
            "relationships.product",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(process) => navigateToResource(process)}
        />
      )}
    </section>
  )
}
