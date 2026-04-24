import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { UserRole } from "@/types/users"

import { useGetUser, useUpdateUser, useChangeUserGroup } from "@/queries/users"

import { toast } from "@/lib/toast"
import { recordToMetadataPairs } from "@/schemas/metadata"

import * as Forms from "@/components/forms"
import * as Users from "@/components/users"

interface EditUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditUserForm({
  open,
  onOpenChange,
}: EditUserFormProps) {
  const { id } = useParams({ from: "/$accountId/app/users/$id" })
  const { data: user } = useGetUser(id)
  const updateUser = useUpdateUser(user?.id ?? "")
  const changeGroup = useChangeUserGroup()

  const form = useForm<
    Schemas.Users.UpdateFormValues,
    unknown,
    Schemas.Users.UpdateValues
  >({
    resolver: zodResolver(Schemas.Users.UpdateSchema),
    mode: "onChange",
    values: {
      email: user?.attributes.email ?? "",
      firstName: user?.attributes.firstName ?? null,
      lastName: user?.attributes.lastName ?? null,
      role: user?.attributes.role ?? UserRole.User,
      permissions: user?.attributes.permissions ?? null,
      groupId: user?.relationships.group?.data?.id ?? null,
      metadata: recordToMetadataPairs(user?.attributes.metadata),
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Users.UpdateValues) => {
      const currentGroupId = user?.relationships.group?.data?.id ?? null
      const newGroupId = values.groupId ?? null

      if (newGroupId !== currentGroupId) {
        await changeGroup.mutateAsync({
          userId: user!.id,
          groupId: newGroupId,
        })
      }

      await updateUser.mutateAsync(values)
      toast({ message: "User updated", variant: "success" })
    },
    [updateUser, changeGroup, user],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing user"
          onSubmit={handleSubmit}
          errorMessage="Failed to update user"
          isPending={updateUser.isPending}
          submitLabel="Update"
          className="md:h-[66vh]!"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Users.Form.Fields
                schema="edit"
                include={["email", "firstName", "lastName"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Users.Form.Fields
                schema="edit"
                include={["password", "permissions", "role"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Users.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />

          <Separator className="my-8" />

          <Forms.Section.Columns title="Relationships">
            <Forms.Section.Column>
              <Users.Form.Fields
                schema="edit"
                include={["groupId"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
