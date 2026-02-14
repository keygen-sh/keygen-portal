import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { useGetEntitlement, useUpdateEntitlement } from "@/queries/entitlements"

import { toast } from "@/lib/toast"

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

  const form = useForm<Schemas.Entitlements.UpdateValues>({
    resolver: zodResolver(Schemas.Entitlements.UpdateSchema),
    mode: "onChange",
    values: {
      name: entitlement?.attributes.name,
      code: entitlement?.attributes.code,
      metadata: entitlement?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit((values) => {
      updateEntitlement.mutate(values, {
        onSuccess: () => {
          toast({ message: "Entitlement updated", variant: "success" })
          onOpenChange(false)
        },
        onError: (error) => {
          toast({
            message: "Failed to update entitlement",
            description: error.detail,
            variant: "error",
          })
        },
      })
    })()
  }, [form, updateEntitlement, onOpenChange])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing entitlement"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
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
      </Form>
    </Forms.Container.Dialog>
  )
}
