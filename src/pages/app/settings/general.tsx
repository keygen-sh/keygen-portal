import { useState } from "react"
import { SquarePen } from "lucide-react"

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
        <div className="flex flex-col items-center py-4 md:py-8">
          <div className="grid grid-cols-1 gap-8 md:w-2/3 md:grid-cols-2">
            <div className="flex flex-col space-y-2 md:min-w-lg">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Account
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Manage account settings and information.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1 md:min-w-lg">
              {account && (
                <Motion.Resize layoutKey={editingAccount ? "edit" : "view"}>
                  {editingAccount ? (
                    <Account.Form.Edit
                      onClose={() => setEditingAccount(false)}
                    />
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex justify-end p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAccount(true)}
                          className="group"
                        >
                          <SquarePen className="size-3.5 text-content-muted transition-colors duration-300 group-hover:text-content-loud" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-4 px-8 pb-4">
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
                Current User
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Manage current user settings and information.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1 p-4 md:min-w-lg">
              {user && (
                <Motion.Resize layoutKey={editingProfile ? "edit" : "view"}>
                  {editingProfile ? (
                    <Users.Form.Profile
                      onClose={() => setEditingProfile(false)}
                    />
                  ) : (
                    <div className="flex flex-col gap-4">
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
                            value={user.attributes.firstName ?? "--"}
                            tooltip={UserAttributeDescriptions.firstName}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Last name"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={user.attributes.lastName ?? "--"}
                            tooltip={UserAttributeDescriptions.lastName}
                          />
                        }
                      />
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProfile(true)}
                        >
                          <SquarePen className="mr-1.5 size-3.5" />
                          Edit
                        </Button>
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
