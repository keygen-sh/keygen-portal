import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import { useCreateEntitlement } from "@/queries/entitlements"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Entitlements from "@/components/entitlements"
import DocumentationLink from "@/components/documentation-link"

interface CreateEntitlementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateEntitlementForm({
  open,
  onOpenChange,
}: CreateEntitlementFormProps) {
  const form = useForm<Schemas.Entitlements.CreateValues>({
    resolver: zodResolver(Schemas.Entitlements.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      metadata: {},
    },
  })
  const createEntitlement = useCreateEntitlement()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Entitlements.CreateValues) => {
      const entitlement = await createEntitlement.mutateAsync(values)
      toast({ message: "Entitlement created", variant: "success" })
      onOpenChange(false)
      await navigateToResource(entitlement)
    },
    [createEntitlement, navigateToResource, onOpenChange],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createEntitlement.isPending}
          description="Creating a new entitlement"
          errorMessage="Failed to create entitlement"
        >
          <Forms.Section.Step
            crumb="Entitlement attributes"
            fields={["name", "code", "metadata"]}
          >
            <Forms.Field.Title>
              <Entitlements.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Entitlement attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Entitlements.Form.Fields
                    schema="create"
                    include={["code"]}
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Entitlements.Form.Fields
                    schema="create"
                    include={["metadata"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="entitlements" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
