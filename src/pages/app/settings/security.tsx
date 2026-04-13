import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import * as Users from "@/components/users"
import * as Motion from "@/components/motion"
import PageHeader from "@/components/page-header"

export default function SecurityPage() {
  const [editingPassword, setEditingPassword] = useState(false)

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
            <div className="overflow-hidden rounded bg-background-1">
              <Motion.Resize layoutKey={editingPassword ? "edit" : "view"}>
                {editingPassword ? (
                  <Users.Form.Password
                    title="Change password"
                    onClose={() => setEditingPassword(false)}
                  />
                ) : (
                  <div className="flex items-center justify-end gap-2 p-2">
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
          </div>
        </div>
      </ScrollArea>
    </section>
  )
}
