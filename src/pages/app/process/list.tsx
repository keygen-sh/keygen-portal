import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useProcessTableColumns } from "@/hooks/use-process-table-columns"

import { Process } from "@/types/processes"
import { useListProcesses } from "@/queries/processes"

import * as keygen from "@/keygen"
import * as Processes from "@/components/processes"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function ProcessesList() {
  const { data: processes = [], isLoading: processesLoading } =
    useListProcesses()
  const columns = useProcessTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectProcess = async (process: Process | null) => {
    if (!process) return

    await navigate({
      to: "/$id/app/processes/$processId",
      params: { id: keygen.config.id, processId: process.id },
    })
  }

  return (
    <section>
      <PageHeader title="Processes">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={processesLoading}>
              Spawn Process
            </Button>
          </DialogTrigger>

          <Processes.Create.Modal
            onSelectProcess={(process) => handleSelectProcess(process)}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

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
          onRowClick={(p) => handleSelectProcess(p)}
        />
      )}
    </section>
  )
}
