import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import { useGetAccount } from "@/queries/accounts"

import {
  AccountKeyDescriptions,
  AccountAttributeDescriptions,
} from "@/types/accounts"

import * as Motion from "@/components/motion"
import * as Account from "@/components/account"
import * as Attribute from "@/components/attribute"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import TooltipBadge from "@/components/tooltip-badge"
import ClipboardValue from "@/components/clipboard-value"

export default function DevelopersPage() {
  const { data: account, isLoading: accountLoading } = useGetAccount()

  const [editingSettings, setEditingSettings] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Developers" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-4 md:px-10 md:py-8">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Developer Settings
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Configure API version and account protection.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              {account && (
                <Motion.Resize layoutKey={editingSettings ? "edit" : "view"}>
                  {editingSettings ? (
                    <Account.Form.Developer
                      title="Editing developer settings"
                      onClose={() => setEditingSettings(false)}
                    />
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-end border-b border-accent p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSettings(true)}
                          className="border-none bg-background-2"
                        >
                          Edit Settings
                        </Button>
                      </div>
                      <div className="flex flex-col gap-4 p-4">
                        <Attribute.Field
                          label="API version"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="raw"
                              value={account.attributes.apiVersion}
                              tooltip={AccountAttributeDescriptions.apiVersion}
                            />
                          }
                        />
                        <Attribute.Field
                          label="Protected"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="boolean"
                              value={account.attributes.protected}
                              tooltip={AccountAttributeDescriptions.protected}
                            />
                          }
                        />
                      </div>
                    </div>
                  )}
                </Motion.Resize>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Public Keys
              </h2>
              <div className="flex flex-col space-y-2 text-sm text-content-muted">
                <p>
                  You can use your public keys to verify certain license files,
                  license keys, webhooks and API response signatures. Please
                  note that formatting must be exact, newlines and all,
                  especially for PEM encoded keys.
                </p>
                <p>
                  Use the copy-to-clipboard buttons to ensure the entire public
                  key is copied correctly.
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              <div className="p-4">
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
              </div>
            </div>
          </div>
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
