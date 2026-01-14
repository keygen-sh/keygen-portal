import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useMachineTableColumns } from "@/hooks/use-machine-table-columns"
import { Machine, MockMachines } from "@/types/machines"

import * as keygen from "@/keygen"
import * as Machines from "@/components/machines"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function MachinesList() {
  const [machinesLoading, setMachinesLoading] = useState(true)
  const columns = useMachineTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectMachine = async (machine: Machine | null) => {
    if (!machine) return

    await navigate({
      to: "/$id/app/machines/$machineId",
      params: { id: keygen.config.id, machineId: machine.id },
    })
  }

  useEffect(() => {
    setTimeout(() => {
      setMachinesLoading(false)
    }, 300)
  }, [])

  return (
    <section>
      <PageHeader title="Machines">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={machinesLoading}>
              New Machine
            </Button>
          </DialogTrigger>

          <Machines.Create.Modal
            onSelectMachine={(machine) => handleSelectMachine(machine)}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {machinesLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Machine>
          data={MockMachines}
          columns={columns}
          hideOnMobile={[
            "relationships.license",
            "relationships.product",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(m) => handleSelectMachine(m)}
        />
      )}
    </section>
  )
}
