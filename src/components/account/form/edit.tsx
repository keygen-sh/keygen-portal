import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"

import { useGetAccount, useUpdateAccount } from "@/queries/accounts"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Account from "@/components/account"

export default function EditAccountForm() {
  const { data: account, isLoading: accountLoading } = useGetAccount()
  const updateAccount = useUpdateAccount()

  const form = useForm<Schemas.Account.UpdateValues>({
    resolver: zodResolver(Schemas.Account.UpdateSchema),
    mode: "onChange",
    values: {
      name: account?.attributes.name ?? "",
      slug: account?.attributes.slug ?? "",
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Account.UpdateValues) => {
      await updateAccount.mutateAsync(values)
      toast({ message: "Account updated", variant: "success" })
    },
    [updateAccount],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Page>
        <Forms.Layout.Sheet
          title="Edit account"
          onSubmit={handleSubmit}
          errorMessage="Failed to update account"
          isPending={accountLoading}
          submitLabel="Update"
          inline
        >
          <Forms.Section.Columns title="Account Details">
            <Forms.Section.Column>
              <Account.Form.Fields
                include={["name", "slug"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Forms.Container.Page>
    </Forms.Provider>
  )
}
