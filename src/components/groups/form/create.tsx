import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { useCreateGroup } from "@/queries/groups"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Groups from "@/components/groups"
import DocumentationLink from "@/components/documentation-link"

interface CreateGroupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateGroupForm({
  open,
  onOpenChange,
}: CreateGroupFormProps) {
  const form = useForm<Schemas.Groups.CreateValues>({
    resolver: zodResolver(Schemas.Groups.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      maxUsers: null,
      maxLicenses: null,
      maxMachines: null,
      metadata: {},
    },
  })
  const createGroup = useCreateGroup()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Groups.CreateValues) => {
      const group = await createGroup.mutateAsync(values)
      toast({ message: "Group created", variant: "success" })
      onOpenChange(false)
      await navigateToResource(group)
    },
    [createGroup, navigateToResource, onOpenChange],
  )

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Wizard
          description="Creating a new group"
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createGroup.isPending}
          errorMessage="Failed to create group"
          className="md:h-[52vh]!"
        >
          <Forms.Section.Step
            crumb="Group attributes"
            fields={[
              "name",
              "maxUsers",
              "maxLicenses",
              "maxMachines",
              "metadata",
            ]}
          >
            <Forms.Field.Title>
              <Groups.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Group attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Groups.Form.Fields
                    schema="create"
                    include={["maxUsers", "maxLicenses"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Groups.Form.Fields
                    schema="create"
                    include={["maxMachines"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <Groups.Form.Fields
                schema="create"
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="groups" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Form>
    </Forms.Container.Dialog>
  )
}
