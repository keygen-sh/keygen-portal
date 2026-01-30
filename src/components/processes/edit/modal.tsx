import { useParams } from "@tanstack/react-router"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"

import { useGetProcess, useUpdateProcess } from "@/queries/processes"

import EditForm from "./edit-form"
import * as Loading from "@/components/loading"

interface ProcessesEditModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export default function ProcessesEditModal({
  open,
  onOpenChange,
}: ProcessesEditModalProps) {
  const { processId } = useParams({
    from: "/$id/app/processes/$processId",
  })
  const {
    data: process,
    isLoading: processLoading,
    isError: processError,
  } = useGetProcess(processId)
  const updateProcess = useUpdateProcess(processId)

  const handleUpdateProcess = (values: Forms.Processes.UpdateValues) => {
    if (!process) return
    updateProcess.mutate(values, {
      onSuccess: () => {
        toast({ message: "Process updated", variant: "success" })
        onOpenChange(false)
      },
      onError: () =>
        toast({ message: "Failed to update process", variant: "error" }),
      onSettled() {
        if (!updateProcess.isError) {
          onOpenChange(false)
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="min-h-screen min-w-screen rounded-none border-none"
      >
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
            Updating an existing process
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {processLoading ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : processError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load process.
          </p>
        ) : (
          open &&
          process && (
            <EditForm
              process={process}
              loading={updateProcess.isPending}
              onUpdate={handleUpdateProcess}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
