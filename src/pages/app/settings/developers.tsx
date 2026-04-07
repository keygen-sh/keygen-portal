import { useMemo, useCallback } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import { useGetAccount, useUpdateAccount } from "@/queries/accounts"

import * as Schemas from "@/schemas"

import { toast } from "@/lib/toast"

import { AccountKeyDescriptions } from "@/types/accounts"

import * as Forms from "@/components/forms"
import * as Account from "@/components/account"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import SectionCard from "@/components/section-card"
import TooltipBadge from "@/components/tooltip-badge"
import ClipboardValue from "@/components/clipboard-value"

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

          <SectionCard title="Public Keys">
            {accountLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : account?.meta?.keys ? (
              <div className="space-y-6">
                <Ed25519KeyField base64Value={account.meta.keys.ed25519} />
                <Separator />
                <EcdsaKeyField base64Value={account.meta.keys.ecdsa} />
                <Separator />
                <RsaKeyField base64Value={account.meta.keys.rsa2048} />
              </div>
            ) : (
              <span className="text-sm text-content-muted">
                No public keys available.
              </span>
            )}
          </SectionCard>
        </div>
      </ScrollArea>
    </section>
  )
}

function Ed25519KeyField({ base64Value }: { base64Value: string }) {
  const { hex, base64 } = useMemo(() => {
    const hexValue = atob(base64Value)
    return { hex: hexValue, base64: base64Value }
  }, [base64Value])

  return (
    <div className="space-y-2">
      <TooltipBadge
        value="Ed25519 128-bit Verify Key"
        tooltip={AccountKeyDescriptions.ed25519}
        variant="outline"
        className="border-none p-0 text-content-loud"
      />
      <Tabs defaultValue="hex">
        <TabsSwitch
          options={[
            { value: "hex", label: "hex" },
            { value: "base64", label: "base64 DER" },
          ]}
          borderless
        />
        <TabsContent value="hex">
          <ClipboardValue value={hex} />
        </TabsContent>
        <TabsContent value="base64">
          <ClipboardValue value={base64} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EcdsaKeyField({ base64Value }: { base64Value: string }) {
  const { pem, base64 } = useMemo(() => {
    const pemValue = atob(base64Value)
    return { pem: pemValue, base64: base64Value }
  }, [base64Value])

  return (
    <div className="space-y-2">
      <TooltipBadge
        value="ECDSA P-256 Public Key"
        tooltip={AccountKeyDescriptions.ecdsa}
        variant="outline"
        className="border-none p-0 text-content-loud"
      />
      <Tabs defaultValue="base64">
        <TabsSwitch
          options={[
            { value: "base64", label: "base64 PEM" },
            { value: "pem", label: "PEM" },
          ]}
          borderless
        />
        <TabsContent value="base64">
          <ClipboardValue value={base64} />
        </TabsContent>
        <TabsContent value="pem">
          <ClipboardValue value={pem} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RsaKeyField({ base64Value }: { base64Value: string }) {
  const { pem, base64 } = useMemo(() => {
    const pemValue = atob(base64Value)
    return { pem: pemValue, base64: base64Value }
  }, [base64Value])

  return (
    <div className="space-y-2">
      <TooltipBadge
        value="RSA 2048-bit Public Key"
        tooltip={AccountKeyDescriptions.rsa2048}
        variant="outline"
        className="border-none p-0 text-content-loud"
      />
      <Tabs defaultValue="base64">
        <TabsSwitch
          options={[
            { value: "base64", label: "base64 PEM" },
            { value: "pem", label: "PEM" },
          ]}
          borderless
        />
        <TabsContent value="base64">
          <ClipboardValue value={base64} />
        </TabsContent>
        <TabsContent value="pem">
          <ClipboardValue value={pem} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
