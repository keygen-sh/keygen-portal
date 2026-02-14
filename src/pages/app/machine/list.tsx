import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useMachineTableColumns } from "@/hooks/use-machine-table-columns"
import { useListMachines } from "@/queries/machines"
import { Machine } from "@/types/machines"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Machines from "@/components/machines"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function MachinesList() {
  const { data: machines = [], isLoading: machinesLoading } = useListMachines()
  const columns = useMachineTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section>
      <PageHeader title="Machines">
        <Button
          size="sm"
          disabled={machinesLoading}
          onClick={() => setOpen(true)}
        >
          New Machine
        </Button>
      </PageHeader>

      <Machines.Form.Create open={open} onOpenChange={setOpen} />

      {machinesLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Machine>
          data={machines}
          columns={columns}
          hideOnMobile={[
            "relationships.license",
            "relationships.product",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(machine) => navigateToResource(machine)}
        />
      )}
    </section>
  )
}
