import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"
import { Entitlement } from "@/types/entitlements"

import { useUpdateEntitlement } from "@/queries/entitlements"

import EditForm from "./edit-form"

interface EntitlementsEditModalProps {
  open: boolean
  onClose: () => void
  entitlement: Entitlement | null
}

export default function EntitlementsEditModal({
  open,
  onClose,
  entitlement,
}: EntitlementsEditModalProps) {
  const updateEntitlement = useUpdateEntitlement(entitlement?.id ?? "")

  const handleUpdateEntitlement = (
    values: Forms.Entitlements.UpdatePayload,
  ) => {
    if (!entitlement) return
    updateEntitlement.mutate(values, {
      onSuccess: () => {
        toast({ message: "Entitlement updated", variant: "success" })
        onClose()
      },
      onError: () =>
        toast({ message: "Failed to update entitlement", variant: "error" }),
      onSettled() {
        if (!updateEntitlement.isError) {
          onClose()
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="md:min-w-4xl">
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
            Updating an existing entitlement
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        <EditForm
          key={entitlement?.id ?? "new"}
          entitlement={entitlement ?? null}
          loading={false}
          onSubmit={handleUpdateEntitlement}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
