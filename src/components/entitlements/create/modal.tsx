import { useState, useCallback } from "react"

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Entitlement, MockEntitlements } from "@/types/entitlements"
import { AttributesFormValues } from "./attributes-form"

// import { useCreateEntitlement } from "@/queries/entitlements"

import { toast } from "@/lib/toast"
import { buildMockEntitlement } from "@/lib/entitlements"

import AttributesForm from "./attributes-form"

interface EntitlementsCreateModalProps {
  onSelectEntitlement: (entitlement: Entitlement | null) => void
  onClose: () => void
}

export default function EntitlementsCreateModal({
  onSelectEntitlement,
  onClose,
}: EntitlementsCreateModalProps) {
  // const createEntitlement = useCreateEntitlement()

  const [formError, _setFormError] = useState<string | null>(null)

  const handleCreateEntitlement = useCallback(
    (values: AttributesFormValues) => {
      if (!values.name) {
        toast({
          message: "Failed to create entitlement",
          description: "Missing required fields.",
          variant: "error",
        })
        return
      }

      //   const _payload = values

      //   createEntitlement.mutate(payload, {
      //     onSuccess: (entitlement) => {
      //       toast({ message: "Entitlement created", variant: "success" })
      //       onSelectEntitlement(entitlement)
      //       onClose()
      //     },
      //     onError: (error) => {
      //       if (
      //         typeof error === "object" &&
      //         error &&
      //         "code" in error &&
      //         error.code === EntitlementErrorCode.CODE_TAKEN
      //       ) {
      //         setFormError("Code already exists")
      //       }
      //       toast({ message: "Failed to create entitlement", variant: "error" })
      //     },
      //   })

      const mockEntitlement = buildMockEntitlement({
        name: values.name,
        code: values.code,
        metadata: values.metadata,
      })

      MockEntitlements.push(mockEntitlement)

      toast({ message: "Entitlement created", variant: "success" })
      onSelectEntitlement(mockEntitlement)
      onClose()
    },
    [onSelectEntitlement, onClose],
  )

  return (
    <DialogContent className="md:min-w-4xl">
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
          Creating a new entitlement
        </DialogDescription>
        <DialogTitle className="sr-only" />
      </DialogHeader>
      <AttributesForm
        key="attributes"
        loading={false}
        error={formError}
        onSubmit={handleCreateEntitlement}
        onCancel={onClose}
      />
    </DialogContent>
  )
}
