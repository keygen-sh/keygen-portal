import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import * as Forms from "@/forms"

import { Process, ProcessStatus, MockProcesses } from "@/types/processes"

import { useListMachines } from "@/queries/machines"

import { toast } from "@/lib/toast"

import * as Loading from "@/components/loading"
import * as Processes from "@/components/processes"
import DocumentationLink from "@/components/documentation-link"

interface ProcessesCreateModalProps {
  onSelectProcess: (process: Process | null) => void
  onClose: () => void
}

export default function ProcessesCreateModal({
  onSelectProcess,
  onClose,
}: ProcessesCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const { data: machines = [] } = useListMachines()

  const form = useForm<Forms.Processes.CreateValues>({
    resolver: zodResolver(Forms.Processes.CreateSchema),
    mode: "onChange",
    defaultValues: {
      pid: "",
      metadata: {},
      machineId: "",
    },
  })

  const handleCreateProcess = useCallback(
    (values: Forms.Processes.CreateValues) => {
      if (!values.machineId) {
        toast({
          message: "Failed to create process",
          description: "Machine is required.",
          variant: "error",
        })
        return
      }

      const machine = machines.find((m) => m.id === values.machineId)
      const licenseId = machine?.relationships?.license?.data?.id
      const productId = machine?.relationships?.product?.data?.id

      setLoading(true)

      const newProcess: Process = {
        id: crypto.randomUUID(),
        type: "processes",
        links: {
          self: `/v1/accounts/{ACCOUNT}/processes/${crypto.randomUUID()}`,
        },
        attributes: {
          pid: values.pid,
          status: ProcessStatus.Alive,
          lastHeartbeat: new Date().toISOString(),
          nextHeartbeat: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          interval: 600,
          metadata: values.metadata ?? {},
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        relationships: {
          account: {
            links: { related: "/v1/accounts/{ACCOUNT}" },
            data: { type: "accounts", id: "{ACCOUNT}" },
          },
          environment: {
            links: { related: null },
            data: null,
          },
          product: {
            links: { related: null },
            data: productId ? { type: "products", id: productId } : undefined,
          },
          license: {
            links: { related: null },
            data: licenseId ? { type: "licenses", id: licenseId } : undefined,
          },
          machine: {
            links: { related: null },
            data: { type: "machines", id: values.machineId },
          },
        },
      }

      MockProcesses.push(newProcess)
      setLoading(false)
      toast({ message: "Process created", variant: "success" })
      onSelectProcess(newProcess)
      onClose()
    },
    [machines, onSelectProcess, onClose],
  )

  return (
    <DialogContent className="min-w-fit">
      <DialogHeader className="h-fit items-start border-b border-accent p-4">
        <DialogDescription className="text-xs">
          Creating a new process
        </DialogDescription>
        <DialogTitle className="sr-only">New Process</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateProcess)}>
          <ScrollArea className="h-[calc(100vh-11rem)] md:h-[50vh] md:w-4xl">
            <Processes.Fields.All layout="create" />

            <DocumentationLink page="processes" />
          </ScrollArea>

          <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              {loading ? <Loading.Dots className="bg-background" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
