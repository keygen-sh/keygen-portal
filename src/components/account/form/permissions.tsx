import { useCallback, type RefObject } from "react"
import { useForm } from "react-hook-form"

import * as Schemas from "@/schemas"

import { useGetAccountSettings, useUpdateAccount } from "@/queries/accounts"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Account from "@/components/account"

interface EditLicensePermissionsFormProps {
  onClose?: () => void
  showCancel?: boolean
  abandonRef?: RefObject<(() => void) | null>
}

export default function EditLicensePermissionsForm({
  onClose,
  showCancel,
  abandonRef,
}: EditLicensePermissionsFormProps) {
  const { data: account, isLoading: accountLoading } = useGetAccountSettings()
  const updateAccount = useUpdateAccount()

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
      await updateAccount.mutateAsync({
        defaultLicensePermissions: values.defaultLicensePermissions,
        defaultUserPermissions: values.defaultUserPermissions,
      })
      toast({ message: "Permissions updated", variant: "success" })
    },
    [updateAccount],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <Forms.Layout.Sheet
          onSubmit={handleSubmit}
          errorMessage="Failed to update license permissions"
          isPending={accountLoading}
          submitLabel="Save"
          onClose={onClose}
          showCancel={showCancel}
          abandonRef={abandonRef}
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
