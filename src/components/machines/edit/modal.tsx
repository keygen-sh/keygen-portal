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

import { useGetMachine, useUpdateMachine } from "@/queries/machines"

import EditForm from "./edit-form"
import * as Loading from "@/components/loading"

interface MachinesEditModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export default function MachinesEditModal({
  open,
  onOpenChange,
}: MachinesEditModalProps) {
  const { id } = useParams({ from: "/$accountId/app/machines/$id" })
  const {
    data: machine,
    isLoading: machineLoading,
    isError: machineError,
  } = useGetMachine(id)
  const updateMachine = useUpdateMachine(id)

  const handleUpdateMachine = (values: Forms.Machines.UpdateValues) => {
    if (!machine) return
    updateMachine.mutate(values, {
      onSuccess: () => {
        toast({ message: "Machine updated", variant: "success" })
        onOpenChange(false)
      },
      onError: () =>
        toast({ message: "Failed to update machine", variant: "error" }),
      onSettled() {
        if (!updateMachine.isError) {
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
            Updating an existing machine
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {machineLoading ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : machineError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load machine.
          </p>
        ) : (
          open &&
          machine && (
            <EditForm
              machine={machine}
              loading={updateMachine.isPending}
              onUpdate={handleUpdateMachine}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
