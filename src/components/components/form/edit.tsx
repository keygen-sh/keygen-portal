import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { useGetComponent, useUpdateComponent } from "@/queries/components"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Components from "@/components/components"

interface EditComponentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditComponentForm({
  open,
  onOpenChange,
}: EditComponentFormProps) {
  const { id } = useParams({ from: "/$accountId/app/components/$id" })
  const { data: component } = useGetComponent(id)

  const updateComponent = useUpdateComponent(component?.id ?? "")

  const form = useForm<Schemas.Components.UpdateValues>({
    resolver: zodResolver(Schemas.Components.UpdateSchema),
    mode: "onChange",
    values: {
      name: component?.attributes.name ?? "",
      metadata: component?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit((values) => {
      updateComponent.mutate(values, {
        onSuccess: () => {
          toast({ message: "Component updated", variant: "success" })
          onOpenChange(false)
        },
        onError: (error) => {
          toast({
            message: "Failed to update component",
            description: error.detail,
            variant: "error",
          })
        },
      })
    })()
  }, [form, updateComponent, onOpenChange])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing component"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={updateComponent.isPending}
          submitLabel="Update"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Components.Form.Fields
                schema="edit"
                include={["name"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Components.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
