import { useCallback } from "react"
import { useForm } from "react-hook-form"

import * as Schemas from "@/schemas"

import {
  useGetAccountSettings,
  useUpdateAccountPermissions,
} from "@/queries/accounts"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Account from "@/components/account"

interface EditLicensePermissionsFormProps {
  title?: string
  onClose?: () => void
}

export default function EditLicensePermissionsForm({
  title,
  onClose,
}: EditLicensePermissionsFormProps) {
  const { data: account, isLoading: accountLoading } = useGetAccountSettings()
  const updatePermissions = useUpdateAccountPermissions()

  const defaultLicensePermissions = account?.find(
    (s) => s.attributes.key === "default_license_permissions",
  )
  const defaultUserPermissions = account?.find(
    (s) => s.attributes.key === "default_user_permissions",
  )

  const form = useForm<Schemas.Account.PermissionsValues>({
    mode: "onChange",
    values: {
      defaultLicensePermissions:
        defaultLicensePermissions?.attributes.value ?? [],
      defaultUserPermissions: defaultUserPermissions?.attributes.value ?? [],
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Account.PermissionsValues) => {
      await updatePermissions.mutateAsync(values)
      toast({ message: "Permissions updated", variant: "success" })
    },
    [updatePermissions],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <Forms.Layout.Sheet
          title={title}
          onSubmit={handleSubmit}
          errorMessage="Failed to update license permissions"
          isPending={accountLoading}
          submitLabel="Save"
          onClose={onClose}
          inline
        >
          <Forms.Section.Stacking>
            <Account.Form.Fields
              include={["defaultLicensePermissions", "defaultUserPermissions"]}
            />
          </Forms.Section.Stacking>
        </Forms.Layout.Sheet>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
