import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import { useCreateComponent } from "@/queries/components"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Components from "@/components/components"
import DocumentationLink from "@/components/documentation-link"

interface CreateComponentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateComponentForm({
  open,
  onOpenChange,
}: CreateComponentFormProps) {
  const form = useForm<Schemas.Components.CreateValues>({
    resolver: zodResolver(Schemas.Components.CreateSchema),
    mode: "onChange",
    defaultValues: {
      fingerprint: "",
      name: "",
      metadata: {},
      machineId: "",
    },
  })
  const createComponent = useCreateComponent()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Components.CreateValues) => {
      const component = await createComponent.mutateAsync(values)
      toast({ message: "Component created", variant: "success" })
      await navigateToResource(component)
    },
    [createComponent, navigateToResource],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createComponent.isPending}
          description="Creating a new component"
          errorMessage="Failed to create component"
        >
          <Forms.Section.Step
            crumb="Component attributes"
            fields={["name", "fingerprint", "machineId", "metadata"]}
          >
            <Forms.Field.Title>
              <Components.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Component attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Components.Form.Fields
                    schema="create"
                    include={["fingerprint"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Components.Form.Fields
                    schema="create"
                    include={["machineId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <Components.Form.Fields schema="create" include={["metadata"]} />
            </Forms.Section.Card>

            <DocumentationLink page="components" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
