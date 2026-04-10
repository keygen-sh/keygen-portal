import { useCallback } from "react"
import { useForm } from "react-hook-form"

import * as Schemas from "@/schemas"

import { useGetAccount, useUpdateAccount } from "@/queries/accounts"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Account from "@/components/account"

interface DeveloperFormProps {
  title?: string
  onClose?: () => void
}

export default function DeveloperForm({ title, onClose }: DeveloperFormProps) {
  const { data: account } = useGetAccount()
  const updateAccount = useUpdateAccount()

  const form = useForm<Schemas.Account.DeveloperValues>({
    mode: "onChange",
    values: {
      apiVersion: account?.attributes.apiVersion ?? "",
      protected: account?.attributes.protected ?? false,
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Account.DeveloperValues) => {
      await updateAccount.mutateAsync(values)
      toast({ message: "Developer settings updated", variant: "success" })
    },
    [updateAccount],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <Forms.Layout.Sheet
          title={title}
          onSubmit={handleSubmit}
          errorMessage="Failed to update developer settings"
          isPending={updateAccount.isPending}
          submitLabel="Save"
          onClose={onClose}
          inline
        >
          <div className="space-y-4">
            <Account.Form.Fields
              include={["apiVersion", "protected"]}
              fieldVariant="stacking"
            />
          </div>
        </Forms.Layout.Sheet>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
