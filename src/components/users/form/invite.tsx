import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { UserRole, PortalRequiredPermissions } from "@/types/users"

import { useCreateUser, useResetPassword } from "@/queries/users"

import { toast } from "@/lib/toast"

import * as Schemas from "@/schemas"

import * as Users from "@/components/users"
import * as Forms from "@/components/forms"

interface InviteUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InviteUserForm({
  open,
  onOpenChange,
}: InviteUserFormProps) {
  const createUser = useCreateUser()
  const resetPassword = useResetPassword()

  const form = useForm<Schemas.Users.InviteValues>({
    resolver: zodResolver(Schemas.Users.InviteSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: UserRole.Admin,
      permissions: [...PortalRequiredPermissions],
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
        className="w-1/3"
      >
        <Forms.Layout.Sheet
          title="Inviting a teammate"
          onSubmit={handleSubmit}
          errorMessage="Failed to send invite"
          submitLabel="Send Invite"
          isPending={createUser.isPending || resetPassword.isPending}
          size="compact"
        >
          <Forms.Section.Stacking>
            <Users.Form.Fields
              include={["email", "internalRole", "internalPermissions"]}
              fieldVariant="stacking"
            />
          </Forms.Section.Stacking>
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
