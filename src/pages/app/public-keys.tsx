import { useMemo } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import TabsSwitch from "@/components/tabs-switch"
import TooltipBadge from "@/components/tooltip-badge"

import { useGetAccount } from "@/queries/accounts"

import { AccountKeyDescriptions } from "@/types/accounts"

import ClipboardValue from "@/components/clipboard-value"
import PageHeader from "@/components/page-header"

export default function PublicKeysPage() {
  const { data: account, isLoading: accountLoading } = useGetAccount()
  const keys = account?.meta?.keys

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Public Keys" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-4 py-6 md:px-10 md:py-8">
          {accountLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : keys ? (
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 gap-6 self-center md:w-2/3 md:grid-cols-2">
                <div className="flex flex-col space-y-2 text-sm text-content-muted">
                  <h2 className="font-owners-wide text-lg text-content-loud">
                    Public Keys
                  </h2>
                  <p>
                    You can use your public keys to verify certain license
                    files, license keys, webhooks and API response signatures.
                    Please note that formatting must be exact, newlines and all,
                    especially for PEM encoded keys.
                  </p>
                  <p>
                    Use the copy-to-clipboard buttons to ensure the entire
                    public key is copied correctly.
                  </p>
                </div>
                <div className="space-y-6 rounded bg-background-1 p-4">
                  <Ed25519KeyField base64Value={keys.ed25519} />
                  <Separator />
                  <EcdsaKeyField base64Value={keys.ecdsa} />
                  <Separator />
                  <RsaKeyField base64Value={keys.rsa2048} />
                </div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-content-muted">
              No public keys available.
            </span>
          )}
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
