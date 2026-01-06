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
import { License, MockLicenses } from "@/types/licenses"

import EditForm from "./edit-form"

import * as Loading from "@/components/loading"

interface LicensesEditModalProps {
  open: boolean
  onClose: () => void
  license: License | null
}

export default function LicensesEditModal({
  open,
  onClose,
  license,
}: LicensesEditModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateLicense = useCallback(
    (values: Forms.Licenses.UpdateValues) => {
      if (!license) return

      setLoading(true)

      // Mock update
      setTimeout(() => {
        const index = MockLicenses.findIndex((l) => l.id === license.id)
        if (index === -1) {
          toast({ message: "License not found", variant: "error" })
          setLoading(false)
          return
        }

        const updated: License = {
          ...license,
          attributes: {
            ...license.attributes,
            name:
              values.name !== undefined ? values.name : license.attributes.name,
            expiry:
              values.expiry !== undefined
                ? values.expiry
                : license.attributes.expiry,
            suspended: values.suspended ?? license.attributes.suspended,
            protected: values.protected ?? license.attributes.protected,
            maxMachines:
              values.maxMachines !== undefined
                ? values.maxMachines
                : license.attributes.maxMachines,
            maxProcesses:
              values.maxProcesses !== undefined
                ? values.maxProcesses
                : license.attributes.maxProcesses,
            maxUsers:
              values.maxUsers !== undefined
                ? values.maxUsers
                : license.attributes.maxUsers,
            maxCores:
              values.maxCores !== undefined
                ? values.maxCores
                : license.attributes.maxCores,
            maxUses:
              values.maxUses !== undefined
                ? values.maxUses
                : license.attributes.maxUses,
            metadata: values.metadata ?? license.attributes.metadata,
            updated: new Date().toISOString(),
          },
        }

        MockLicenses[index] = updated
        setLoading(false)
        toast({ message: "License updated", variant: "success" })
        onClose()
      }, 500)
    },
    [license, onClose],
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
            Updating an existing license
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {!license ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : (
          open && (
            <EditForm
              license={license}
              loading={loading}
              onUpdate={handleUpdateLicense}
              onCancel={onClose}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
