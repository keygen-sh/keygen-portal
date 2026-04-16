import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { SecondFactorMode } from "@/types/second-factors"

import { useGetCurrentUserSecondFactor } from "@/queries/second-factors"

import * as Users from "@/components/users"
import * as Motion from "@/components/motion"
import PageHeader from "@/components/page-header"

export default function SecurityPage() {
  const [editingPassword, setEditingPassword] = useState(false)
  const [secondFactorMode, setSecondFactorMode] = useState<SecondFactorMode>(
    SecondFactorMode.View,
  )

  const { data: secondFactors = [], isLoading } =
    useGetCurrentUserSecondFactor()

  const enabledFactor = secondFactors.find((f) => f.attributes.enabled)
  const orphanedFactor = secondFactors.find((f) => !f.attributes.enabled)
  const isEnabled = !!enabledFactor

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Security" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col px-4 py-4 md:px-10 md:py-8">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Password
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Change your password.
              </p>
            </div>
            <div className="h-fit overflow-hidden rounded bg-background-1">
              <Motion.Resize layoutKey={editingPassword ? "edit" : "view"}>
                {editingPassword ? (
                  <Users.Form.Password
                    title="Changing password"
                    onClose={() => setEditingPassword(false)}
                  />
                ) : (
                  <div className="flex items-center justify-end p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPassword(true)}
                      className="border-none bg-background-2"
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </Motion.Resize>
            </div>

            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Two-Factor
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Manage two-factor authentication.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              <Motion.Resize layoutKey={secondFactorMode}>
                {!isLoading && secondFactorMode === SecondFactorMode.Enable ? (
                  <Users.Form.SecondFactor.Enable
                    orphanedFactor={orphanedFactor}
                    onClose={() => setSecondFactorMode(SecondFactorMode.View)}
                  />
                ) : !isLoading &&
                  secondFactorMode === SecondFactorMode.Disable &&
                  enabledFactor ? (
                  <Users.Form.SecondFactor.Disable
                    factor={enabledFactor}
                    onClose={() => setSecondFactorMode(SecondFactorMode.View)}
                  />
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-end border-b border-accent p-2">
                      {isEnabled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSecondFactorMode(SecondFactorMode.Disable)
                          }
                          className="border-none bg-background-2"
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSecondFactorMode(SecondFactorMode.Enable)
                          }
                          className="border-none bg-background-2"
                        >
                          Enable
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-col gap-4 p-4">
                      <p className="mr-auto text-sm text-content-muted">
                        Your two-factor authentication is currently{" "}
                        {isEnabled ? (
                          <>
                            <Badge variant="success" className="ml-0.5">
                              Enabled
                            </Badge>
                            .
                          </>
                        ) : (
                          <span>disabled.</span>
                        )}
                      </p>
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
