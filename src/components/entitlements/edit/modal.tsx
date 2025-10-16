import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import { Entitlement } from "@/types/entitlements"
import { MockEntitlements } from "@/mock/entitlements"
import type { EditFormValues } from "./edit-form"

// import { useUpdateEntitlement } from "@/queries/entitlements"

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
  // const updateEntitlement = useUpdateEntitlement(Entitlement?.id ?? "")

  const handleUpdateEntitlement = (values: EditFormValues) => {
    if (!entitlement) return
    // updateEntitlement.mutate(values, {
    //   onSuccess: () => {
    //     toast({ message: "Entitlement updated", variant: "success" })
    //     onClose()
    //   },
    //   onError: () =>
    //     toast({ message: "Failed to update entitlement", variant: "error" }),
    //   onSettled() {
    //     if (!updateEntitlement.isError) {
    //       onClose()
    //     }
    //   },
    // })

    const index = MockEntitlements.findIndex((e) => e.id === entitlement.id)
    if (index === -1) {
      toast({ message: "Entitlement not found", variant: "error" })
      return
    }

    const prev = MockEntitlements[index]
    const updated: Entitlement = {
      ...prev,
      attributes: {
        ...prev.attributes,
        name: values.name ?? prev.attributes.name,
        code: values.code ?? prev.attributes.code,
        metadata: values.metadata ?? prev.attributes.metadata ?? {},
        updated: new Date().toISOString(),
      },
    }

    MockEntitlements[index] = updated
    toast({ message: "Entitlement updated", variant: "success" })
    onClose()
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
