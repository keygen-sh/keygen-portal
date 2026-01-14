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
import { Machine, MockMachines } from "@/types/machines"

import EditForm from "./edit-form"

import * as Loading from "@/components/loading"

interface MachinesEditModalProps {
  open: boolean
  onClose: () => void
  machine: Machine | null
}

export default function MachinesEditModal({
  open,
  onClose,
  machine,
}: MachinesEditModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateMachine = useCallback(
    (values: Forms.Machines.UpdateValues) => {
      if (!machine) return

      setLoading(true)

      // Mock update
      setTimeout(() => {
        const index = MockMachines.findIndex((m) => m.id === machine.id)
        if (index === -1) {
          toast({ message: "Machine not found", variant: "error" })
          setLoading(false)
          return
        }

        const updated: Machine = {
          ...machine,
          attributes: {
            ...machine.attributes,
            name:
              values.name !== undefined ? values.name : machine.attributes.name,
            ip: values.ip !== undefined ? values.ip : machine.attributes.ip,
            hostname:
              values.hostname !== undefined
                ? values.hostname
                : machine.attributes.hostname,
            platform:
              values.platform !== undefined
                ? values.platform
                : machine.attributes.platform,
            cores:
              values.cores !== undefined
                ? values.cores
                : machine.attributes.cores,
            memory:
              values.memory !== undefined
                ? values.memory
                : machine.attributes.memory,
            disk:
              values.disk !== undefined ? values.disk : machine.attributes.disk,
            metadata: values.metadata ?? machine.attributes.metadata,
            updated: new Date().toISOString(),
          },
          relationships: {
            ...machine.relationships,
            group:
              values.groupId !== undefined
                ? values.groupId
                  ? { data: { type: "groups", id: values.groupId } }
                  : null
                : machine.relationships.group,
            owner:
              values.ownerId !== undefined
                ? values.ownerId
                  ? { data: { type: "users", id: values.ownerId } }
                  : null
                : machine.relationships.owner,
          },
        }

        MockMachines[index] = updated
        setLoading(false)
        toast({ message: "Machine updated", variant: "success" })
        onClose()
      }, 500)
    },
    [machine, onClose],
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
            Updating an existing machine
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {!machine ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : (
          open && (
            <EditForm
              machine={machine}
              loading={loading}
              onUpdate={handleUpdateMachine}
              onCancel={onClose}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
