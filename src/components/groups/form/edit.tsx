import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"

import { useGetGroup, useUpdateGroup } from "@/queries/groups"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Groups from "@/components/groups"

interface EditGroupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditGroupForm({
  open,
  onOpenChange,
}: EditGroupFormProps) {
  const { id } = useParams({ from: "/$accountId/app/groups/$id" })
  const { data: group } = useGetGroup(id)

  const updateGroup = useUpdateGroup(group?.id ?? "")

  const form = useForm<Schemas.Groups.UpdateValues>({
    resolver: zodResolver(Schemas.Groups.UpdateSchema),
    mode: "onChange",
    values: {
      name: group?.attributes.name,
      maxUsers: group?.attributes.maxUsers ?? null,
      maxLicenses: group?.attributes.maxLicenses ?? null,
      maxMachines: group?.attributes.maxMachines ?? null,
      metadata: group?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(async () => {
    const values = form.getValues()
    await updateGroup.mutateAsync(values)
    toast({ message: "Group updated", variant: "success" })
    onOpenChange(false)
  }, [form, updateGroup, onOpenChange])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing group"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          errorMessage="Failed to update group"
          isPending={updateGroup.isPending}
          submitLabel="Update"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Groups.Form.Fields
                schema="edit"
                include={["maxLicenses", "maxUsers"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Groups.Form.Fields
                schema="edit"
                include={["maxMachines", "name"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Groups.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
