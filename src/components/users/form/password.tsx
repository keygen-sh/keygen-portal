import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"

import { useChangePassword } from "@/queries/users"

import { toast } from "@/lib/toast"

import * as Users from "@/components/users"
import * as Forms from "@/components/forms"

export default function ChangePasswordForm() {
  const changePassword = useChangePassword()

  const form = useForm<Schemas.Users.PasswordValues>({
    resolver: zodResolver(Schemas.Users.PasswordSchema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Users.PasswordValues) => {
      await changePassword.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      toast({ message: "Password changed", variant: "success" })
      form.reset()
    },
    [changePassword, form],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <Forms.Layout.Sheet
          title="Change password"
          onSubmit={handleSubmit}
          errorMessage="Failed to change password"
          submitLabel="Change password"
        >
          <Forms.Section.Stacking>
            <Users.Form.Fields
              include={["oldPassword", "newPassword", "confirmPassword"]}
            />
          </Forms.Section.Stacking>
        </Forms.Layout.Sheet>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
