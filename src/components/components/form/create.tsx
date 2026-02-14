import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

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

  const handleCreateComponent = useCallback(
    (values: Schemas.Components.CreateValues) => {
      createComponent.mutate(values, {
        onSuccess: async (component) => {
          toast({ message: "Component created", variant: "success" })
          onOpenChange(false)
          await navigateToResource(component)
        },
        onError: (error) => {
          toast({
            message: "Failed to create component",
            description: error.detail,
            variant: "error",
          })
        },
      })
    },
    [createComponent, navigateToResource, onOpenChange],
  )

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit(handleCreateComponent)()
  }, [form, handleCreateComponent])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createComponent.isPending}
          description="Creating a new component"
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
      </Form>
    </Forms.Container.Dialog>
  )
}
