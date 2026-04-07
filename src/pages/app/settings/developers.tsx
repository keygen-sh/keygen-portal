import { useCallback } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useGetAccount, useUpdateAccount } from "@/queries/accounts"

import * as Schemas from "@/schemas"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Account from "@/components/account"
import PageHeader from "@/components/page-header"
import SectionCard from "@/components/section-card"

export default function DevelopersPage() {
  const { data: account, isLoading: accountLoading } = useGetAccount()
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
      try {
        await updateAccount.mutateAsync(values)
        toast({ message: "Developer settings updated", variant: "success" })
      } catch {
        toast({
          message: "Failed to update developer settings",
          variant: "error",
        })
      }
    },
    [updateAccount],
  )

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Developers" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-6 md:px-10 md:py-8">
          <SectionCard title="Developer Settings">
            <Forms.Provider form={form}>
              <Forms.Section.Stacking>
                <Account.Form.Fields include={["apiVersion", "protected"]} />
              </Forms.Section.Stacking>
              <div className="pt-4">
                <Button
                  type="button"
                  size="sm"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={accountLoading || updateAccount.isPending}
                >
                  {updateAccount.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </Forms.Provider>
          </SectionCard>
        </div>
      </ScrollArea>
    </section>
  )
}
