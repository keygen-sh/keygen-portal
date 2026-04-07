import { useCallback, type RefObject } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"

import { useGetCurrentUser, useUpdateCurrentUser } from "@/queries/users"

import { toast } from "@/lib/toast"

import * as Users from "@/components/users"
import * as Forms from "@/components/forms"

interface EditProfileFormProps {
  onClose?: () => void
  showCancel?: boolean
  abandonRef?: RefObject<(() => void) | null>
}

export default function EditProfileForm({
  onClose,
  showCancel,
  abandonRef,
}: EditProfileFormProps) {
  const { data: user, isLoading } = useGetCurrentUser()
  const updateUser = useUpdateCurrentUser()

  const form = useForm<Schemas.Users.UpdateValues>({
    resolver: zodResolver(Schemas.Users.UpdateSchema),
    mode: "onChange",
    values: {
      email: user?.attributes.email ?? "",
      firstName: user?.attributes.firstName ?? null,
      lastName: user?.attributes.lastName ?? null,
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Users.UpdateValues) => {
      await updateUser.mutateAsync(values)
      toast({ message: "Profile updated", variant: "success" })
    },
    [updateUser],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <Forms.Layout.Sheet
          onSubmit={handleSubmit}
          errorMessage="Failed to update profile"
          isPending={isLoading}
          submitLabel="Update"
          onClose={onClose}
          showCancel={showCancel}
          abandonRef={abandonRef}
          inline
        >
          <div className="space-y-4">
            <Users.Form.Fields
              schema="edit"
              include={["email", "firstName", "lastName"]}
              fieldVariant="stacking"
            />
          </div>
        </Forms.Layout.Sheet>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
