import { useCallback } from "react"
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
import { Process } from "@/types/processes"

import { useCreateProcess } from "@/queries/processes"

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
  const createProcess = useCreateProcess()

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
      createProcess.mutate(values, {
        onSuccess: (process) => {
          toast({ message: "Process spawned", variant: "success" })
          onSelectProcess(process)
          onClose()
        },
        onError: (error) => {
          toast({
            message: "Failed to spawn process",
            description: error.detail,
            variant: "error",
          })
        },
      })
    },
    [createProcess, onSelectProcess, onClose],
  )

  return (
    <DialogContent className="min-w-fit">
      <DialogHeader className="h-fit items-start border-b border-accent p-4">
        <DialogDescription className="text-xs">
          Spawning a new process
        </DialogDescription>
        <DialogTitle className="sr-only">Spawn Process</DialogTitle>
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
              disabled={createProcess.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createProcess.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {createProcess.isPending ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Spawn"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
