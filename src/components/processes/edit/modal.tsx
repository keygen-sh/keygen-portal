import { useCallback, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"
import { Process, MockProcesses } from "@/types/processes"

import EditForm from "./edit-form"

import * as Loading from "@/components/loading"

interface ProcessesEditModalProps {
  open: boolean
  onClose: () => void
  process: Process | null
}

export default function ProcessesEditModal({
  open,
  onClose,
  process,
}: ProcessesEditModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateProcess = useCallback(
    (values: Forms.Processes.UpdateValues) => {
      if (!process) return

      setLoading(true)

      const index = MockProcesses.findIndex((p) => p.id === process.id)
      if (index === -1) {
        toast({ message: "Process not found", variant: "error" })
        setLoading(false)
        return
      }

      const updated: Process = {
        ...process,
        attributes: {
          ...process.attributes,
          metadata: values.metadata ?? process.attributes.metadata,
          updated: new Date().toISOString(),
        },
      }

      MockProcesses[index] = updated
      setLoading(false)
      toast({ message: "Process updated", variant: "success" })
      onClose()
    },
    [process, onClose],
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
        {!process ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : (
          open && (
            <EditForm
              process={process}
              loading={loading}
              onUpdate={handleUpdateProcess}
              onCancel={onClose}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
