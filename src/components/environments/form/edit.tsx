import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { Environment } from "@/types/environments"

import { useUpdateEnvironment } from "@/queries/environments"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Environments from "@/components/environments"
import DocumentationLink from "@/components/documentation-link"

interface EditEnvironmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  environment: Environment
}

export default function EditEnvironmentForm({
  open,
  onOpenChange,
  environment,
}: EditEnvironmentFormProps) {
  const updateEnvironment = useUpdateEnvironment(environment.id)

  const form = useForm<Schemas.Environments.UpdateValues>({
    resolver: zodResolver(Schemas.Environments.UpdateSchema),
    mode: "onChange",
    values: {
      name: environment.attributes.name,
      code: environment.attributes.code,
    },
  })

  const handleSubmit = useCallback(async () => {
    const values = form.getValues()
    await updateEnvironment.mutateAsync(values)
    toast({ message: "Environment updated", variant: "success" })
    onOpenChange(false)
  }, [form, updateEnvironment, onOpenChange])

  return (
    <Forms.Container.Dialog
      open={open}
      onOpenChange={onOpenChange}
      disableOverlay
    >
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing environment"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          errorMessage="Failed to update environment"
          isPending={updateEnvironment.isPending}
          submitLabel="Update"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Environments.Form.Fields
                schema="edit"
                include={["name", "code"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <DocumentationLink page="environments" className="mx-0" />
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
