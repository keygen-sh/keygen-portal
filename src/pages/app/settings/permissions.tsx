import { useState } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { useGetAccountSettings } from "@/queries/accounts"

import { AccountFormFieldDescriptions } from "@/types/accounts"

import * as Motion from "@/components/motion"
import * as Account from "@/components/account"
import * as Attribute from "@/components/attribute"
import PageHeader from "@/components/page-header"

export default function PermissionsPage() {
  const { data: settings } = useGetAccountSettings()

  const [editingPermissions, setEditingPermissions] = useState(false)

  const defaultLicensePermissions =
    settings?.find((s) => s.attributes.key === "default_license_permissions")
      ?.attributes.value ?? []
  const defaultUserPermissions =
    settings?.find((s) => s.attributes.key === "default_user_permissions")
      ?.attributes.value ?? []

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Permissions" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-4 md:px-10 md:py-8">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Default Permissions
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Configure default permissions for new licenses and users.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              <Motion.Resize layoutKey={editingPermissions ? "edit" : "view"}>
                {editingPermissions ? (
                  <Account.Form.Permissions
                    title="Editing permissions"
                    onClose={() => setEditingPermissions(false)}
                  />
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-end border-b border-accent p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPermissions(true)}
                        className="border-none bg-background-2"
                      >
                        Edit Permissions
                      </Button>
                    </div>
                    <div className="flex flex-col gap-4 p-4">
                      <Attribute.Field
                        label="License permissions"
                        variant="stacking"
                        tooltip={
                          AccountFormFieldDescriptions.defaultLicensePermissions
                        }
                        value={
                          defaultLicensePermissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {defaultLicensePermissions.map((p) => (
                                <Badge
                                  key={p}
                                  variant="outline"
                                  className="text-xs text-content-muted"
                                >
                                  {p}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-content-muted">
                              Using system defaults
                            </span>
                          )
                        }
                      />
                      <Attribute.Field
                        label="User permissions"
                        variant="stacking"
                        tooltip={
                          AccountFormFieldDescriptions.defaultUserPermissions
                        }
                        value={
                          defaultUserPermissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {defaultUserPermissions.map((p) => (
                                <Badge
                                  key={p}
                                  variant="outline"
                                  className="text-xs text-content-muted"
                                >
                                  {p}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-content-muted">
                              Using system defaults
                            </span>
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </Motion.Resize>
            </div>
          </div>
        </div>
      </ScrollArea>
    </section>
  )
}
