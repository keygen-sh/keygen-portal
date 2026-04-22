import { useCallback } from "react"
import { useForm } from "react-hook-form"

import * as Schemas from "@/schemas"
import { UserRole } from "@/types/users"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useCreateUser, useChangeUserGroup } from "@/queries/users"

import { toast } from "@/lib/toast"
import { transformingZodResolver } from "@/lib/form"

import * as Forms from "@/components/forms"
import * as Users from "@/components/users"
import DocumentationLink from "@/components/documentation-link"

interface CreateUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateUserForm({
  open,
  onOpenChange,
}: CreateUserFormProps) {
  const form = useForm<
    Schemas.Users.CreateInputValues,
    unknown,
    Schemas.Users.CreateValues
  >({
    resolver: transformingZodResolver(Schemas.Users.CreateSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      firstName: null,
      lastName: null,
      password: null,
      role: UserRole.User,
      permissions: null,
      groupId: null,
      metadata: [],
    },
  })

  const createUser = useCreateUser()
  const changeGroup = useChangeUserGroup()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Users.CreateValues) => {
      const user = await createUser.mutateAsync(values)

      if (values.groupId) {
        await changeGroup.mutateAsync({
          userId: user.id,
          groupId: values.groupId,
        })
      }

      toast({ message: "User created", variant: "success" })
      await navigateToResource(user)
    },
    [createUser, changeGroup, navigateToResource],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createUser.isPending}
          description="Creating a new user"
          errorMessage="Failed to create user"
        >
          <Forms.Section.Step
            crumb="General attributes"
            fields={["email", "password", "permissions"]}
          >
            <Forms.Field.Title>
              <Users.Form.Fields
                schema="create"
                include={["email"]}
                titleVariant
                autoFocus="email"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="General attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Users.Form.Fields
                    schema="create"
                    include={["password"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Users.Form.Fields
                    schema="create"
                    include={["permissions"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="users" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Profile configuration"
            fields={["firstName", "lastName", "role"]}
          >
            <Forms.Section.Card title="Profile configuration">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Users.Form.Fields
                    schema="create"
                    include={["firstName", "lastName"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Users.Form.Fields
                    schema="create"
                    include={["role"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="users" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Additional configuration"
            fields={["groupId", "metadata"]}
          >
            <Forms.Section.Card title="Additional configuration">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Users.Form.Fields
                    schema="create"
                    include={["groupId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Users.Form.Fields
                    schema="create"
                    include={["metadata"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="users" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
