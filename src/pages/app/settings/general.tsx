import { useState } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

import { useGetAccount } from "@/queries/accounts"
import { useGetCurrentUser } from "@/queries/users"

import { useMobile } from "@/hooks/use-mobile"

import { UserAttributeDescriptions } from "@/types/users"
import { AccountAttributeDescriptions } from "@/types/accounts"

import { copyToClipboard } from "@/lib/clipboard"

import * as Users from "@/components/users"
import * as Motion from "@/components/motion"
import * as Account from "@/components/account"
import * as Attribute from "@/components/attribute"
import Can from "@/components/can"
import PageHeader from "@/components/page-header"
import ClipboardButton from "@/components/clipboard-button"

export default function General() {
  const isMobile = useMobile()

  const { data: account } = useGetAccount()
  const { data: user } = useGetCurrentUser()

  const [editingAccount, setEditingAccount] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="General" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col px-4 py-4 md:px-10 md:py-8">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Account
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Manage account settings and information.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              {account && (
                <Motion.Resize layoutKey={editingAccount ? "edit" : "view"}>
                  {editingAccount ? (
                    <Account.Form.Edit
                      title="Editing account"
                      onClose={() => setEditingAccount(false)}
                    />
                  ) : (
                    <div className="flex flex-col">
                      <Can permission="account.update">
                        <div className="flex items-center justify-end border-b border-accent p-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAccount(true)}
                            className="border-none bg-background-2"
                          >
                            Edit Account
                          </Button>
                        </div>
                      </Can>
                      <div className="flex flex-col gap-4 p-4">
                        <Attribute.Field
                          label="ID"
                          variant="none"
                          value={
                            <ClipboardButton
                              value={account.id}
                              truncate={isMobile}
                              onClick={() => copyToClipboard(account.id)}
                              className="w-fit text-sm"
                            />
                          }
                        />
                        <Attribute.Field
                          label="Name"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="raw"
                              value={account.attributes.name}
                              tooltip={AccountAttributeDescriptions.name}
                            />
                          }
                        />
                        <Attribute.Field
                          label="Slug"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="raw"
                              value={account.attributes.slug}
                              tooltip={AccountAttributeDescriptions.slug}
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
                You
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Manage your settings and information.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              {user && (
                <Motion.Resize layoutKey={editingProfile ? "edit" : "view"}>
                  {editingProfile ? (
                    <Users.Form.Profile
                      title="Editing profile"
                      onClose={() => setEditingProfile(false)}
                    />
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-end border-b border-accent p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProfile(true)}
                          className="border-none bg-background-2"
                        >
                          Edit Profile
                        </Button>
                      </div>
                      <div className="flex flex-col gap-4 p-4">
                        <Attribute.Field
                          label="Email"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="raw"
                              value={user.attributes.email}
                              tooltip={UserAttributeDescriptions.email}
                            />
                          }
                        />
                        <Attribute.Field
                          label="First name"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="string"
                              value={user.attributes.firstName}
                              tooltip={UserAttributeDescriptions.firstName}
                              emptyLabel="Not set"
                            />
                          }
                        />
                        <Attribute.Field
                          label="Last name"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="string"
                              value={user.attributes.lastName}
                              tooltip={UserAttributeDescriptions.lastName}
                              emptyLabel="Not set"
                            />
                          }
                        />
                      </div>
                    </div>
                  )}
                </Motion.Resize>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </section>
  )
}
