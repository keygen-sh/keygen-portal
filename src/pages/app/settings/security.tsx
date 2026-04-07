import { useMemo } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import { useGetAccount } from "@/queries/accounts"

import { AccountKeyDescriptions } from "@/types/accounts"

import * as Users from "@/components/users"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import SectionCard from "@/components/section-card"
import TooltipBadge from "@/components/tooltip-badge"
import ClipboardValue from "@/components/clipboard-value"

export default function SecurityPage() {
  const { data: account, isLoading: accountLoading } = useGetAccount()

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Security" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-6 md:px-10 md:py-8">
          <SectionCard title="Change Password">
            <Users.Form.Password />
          </SectionCard>

          <SectionCard title="Two-Factor Authentication">TODO</SectionCard>

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
