import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { useGetEntitlement, useUpdateEntitlement } from "@/queries/entitlements"

import { toast } from "@/lib/toast"
import { transformingZodResolver } from "@/lib/form"
import { recordToPairs } from "@/schemas/metadata"

import * as Forms from "@/components/forms"
import * as Entitlements from "@/components/entitlements"

interface EditEntitlementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditEntitlementForm({
  open,
  onOpenChange,
}: EditEntitlementFormProps) {
  const { id } = useParams({ from: "/$accountId/app/entitlements/$id" })
  const { data: entitlement } = useGetEntitlement(id)

  const updateEntitlement = useUpdateEntitlement(entitlement?.id ?? "")

  const form = useForm<
    Schemas.Entitlements.UpdateInputValues,
    unknown,
    Schemas.Entitlements.UpdateValues
  >({
    resolver: transformingZodResolver(Schemas.Entitlements.UpdateSchema),
    mode: "onChange",
    values: {
      name: entitlement?.attributes.name,
      code: entitlement?.attributes.code,
      metadata: recordToPairs(entitlement?.attributes.metadata),
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Entitlements.UpdateValues) => {
      await updateEntitlement.mutateAsync(values)
      toast({ message: "Entitlement updated", variant: "success" })
    },
    [updateEntitlement],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing entitlement"
          onSubmit={handleSubmit}
          errorMessage="Failed to update entitlement"
          isPending={updateEntitlement.isPending}
          submitLabel="Update"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Entitlements.Form.Fields
                schema="edit"
                include={["code"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Entitlements.Form.Fields
                schema="edit"
                include={["name"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Entitlements.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
