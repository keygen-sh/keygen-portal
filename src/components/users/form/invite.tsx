import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Separator } from "@/components/ui/separator"

import { UserRole } from "@/types/users"

import { useCreateUser, useForgotPassword } from "@/queries/users"

import { usePermissions } from "@/hooks/use-permissions"

import { toast } from "@/lib/toast"
import { permissionsForRole } from "@/lib/permissions"

import * as Schemas from "@/schemas"

import * as keygen from "@/keygen"
import * as Users from "@/components/users"
import * as Forms from "@/components/forms"
import { Notice } from "@/components/notice"

interface InviteUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InviteUserForm({
  open,
  onOpenChange,
}: InviteUserFormProps) {
  const createUser = useCreateUser()
  const resetPassword = useForgotPassword()

  const { permissions: currentPermissions } = usePermissions()

  const form = useForm<Schemas.Users.InviteValues>({
    resolver: zodResolver(Schemas.Users.InviteSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: UserRole.Admin,
      permissions: permissionsForRole(currentPermissions, UserRole.Admin),
    },
  })

  const handleSubmit = async (values: Schemas.Users.InviteValues) => {
    await createUser.mutateAsync(values)
    await resetPassword.mutateAsync({ email: values.email })
    toast({ message: "Invite sent", variant: "success" })
  }

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="compact"
        className="md:w-1/2"
      >
        <Forms.Layout.Sheet
          title="Inviting a teammate"
          onSubmit={handleSubmit}
          errorMessage="Failed to send invite"
          submitLabel="Send Invite"
          isPending={createUser.isPending || resetPassword.isPending}
          size="compact"
        >
          <Forms.Section.Columns>
            <Forms.Section.Column>
              <Users.Form.Fields
                include={["email", "internalRole"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Users.Form.Fields
                include={["firstName", "lastName"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          {!keygen.config.isCE && (
            <>
              <Separator dashed className="my-8" />

              <Users.Form.Fields
                schema="invite"
                include={["internalPermissions"]}
                fieldVariant="stacking"
              />

              <Notice className="mt-4">
                <Notice.Title>
                  New teammates start with the same permissions you have.
                </Notice.Title>
                <Notice.Description>
                  We recommend narrowing these permissions to only what this
                  teammate needs. Permissions required for Portal access are
                  flagged, and removing them will lock the teammate out of
                  Portal.
                </Notice.Description>
              </Notice>
            </>
          )}
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
