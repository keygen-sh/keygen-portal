import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import { UserRole } from "@/types/users"

import { useCreateUser, useForgotPassword } from "@/queries/users"

import { usePermissions } from "@/hooks/use-permissions"

import * as fathom from "@/fathom"

import { toast } from "@/lib/toast"
import { settleInviteUsers } from "@/lib/users"
import { permissionsForRole } from "@/lib/permissions"

import * as Forms from "@/components/forms"
import * as Users from "@/components/users"
import { Notice } from "@/components/notice"
import DocumentationLink from "@/components/documentation-link"

interface InviteOnboardingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InviteOnboardingForm({
  open,
  onOpenChange,
}: InviteOnboardingFormProps) {
  const { permissions: currentPermissions } = usePermissions()

  const form = useForm<
    Schemas.Users.InvitesFormValues,
    unknown,
    Schemas.Users.InvitesValues
  >({
    resolver: zodResolver(Schemas.Users.InvitesSchema),
    mode: "onChange",
    defaultValues: {
      invites: [
        {
          email: "",
          firstName: null,
          lastName: null,
          role: UserRole.Admin,
          permissions: permissionsForRole(currentPermissions, UserRole.Admin),
        },
      ],
    },
  })

  const createUser = useCreateUser()
  const resetPassword = useForgotPassword()

  const handleSubmit = useCallback(
    async (values: Schemas.Users.InvitesValues) => {
      const invited = await settleInviteUsers({
        form,
        values: values.invites,
        createMutation: createUser,
        resetMutation: resetPassword,
      })

      if (!invited) {
        throw new Error("Failed to invite teammate(s)")
      }

      toast({
        message: invited.length === 1 ? "Invite sent" : "Invites sent",
        variant: "success",
      })
      fathom.track("onboarding: invite completed")
    },
    [form, createUser, resetPassword],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createUser.isPending || resetPassword.isPending}
          description="Inviting teammates"
          errorMessage="Failed to invite teammate(s)"
          submitLabel="Submit"
        >
          <Forms.Section.Step crumb="Invite teammates" fields={["invites"]}>
            <div className="flex flex-col gap-4 p-6">
              <Notice className="max-w-3xl">
                <Notice.Title>
                  Teammates get their own login credentials and permissions.
                </Notice.Title>
                <Notice.Description>
                  Having separate internal users can be helpful for managing
                  your products, policies, and licenses without giving them full
                  administrative access. Invited teammates will receive an email
                  to set their password. You can also do this later from the
                  Team page.
                </Notice.Description>
              </Notice>

              <Users.Form.Fields schema="invites" include={["invites"]} />

              <DocumentationLink page="users" />
            </div>
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
