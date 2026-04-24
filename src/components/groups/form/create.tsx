import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
  const form = useForm<
    Schemas.Groups.CreateFormValues,
    unknown,
    Schemas.Groups.CreateValues
  >({
    resolver: zodResolver(Schemas.Groups.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      maxUsers: null,
      maxLicenses: null,
      maxMachines: null,
      metadata: [],
    },
  })
  const createGroup = useCreateGroup()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Groups.CreateValues) => {
      const group = await createGroup.mutateAsync(values)
      toast({ message: "Group created", variant: "success" })
      await navigateToResource(group)
    },
    [createGroup, navigateToResource],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          description="Creating a new group"
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
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
