import { useRef, useState } from "react"
import { X } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

import * as Users from "@/components/users"
import * as Motion from "@/components/motion"
import PageHeader from "@/components/page-header"

export default function SecurityPage() {
  const [editingPassword, setEditingPassword] = useState(false)

  const abandonPasswordRef = useRef<(() => void) | null>(null)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Security" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-4 md:px-10 md:py-8">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Password
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Change your account password.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              <Motion.Resize layoutKey={editingPassword ? "edit" : "view"}>
                {editingPassword ? (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between border-b border-accent p-2">
                      <h2 className="ml-2 text-sm text-content-muted">
                        Change password
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abandonPasswordRef.current?.()}
                      >
                        <X className="size-3.5 text-content-muted" />
                      </Button>
                    </div>
                    <Users.Form.Password
                      onClose={() => setEditingPassword(false)}
                      showCancel={false}
                      abandonRef={abandonPasswordRef}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-end border-b border-accent p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPassword(true)}
                        className="border-none bg-background-2"
                      >
                        Change Password
                      </Button>
                    </div>
                    <div className="flex flex-col gap-4 p-4">
                      <p className="text-sm text-content-muted">
                        Use a strong password that you don't use elsewhere.
                      </p>
                    </div>
                  </div>
                )}
              </Motion.Resize>
            </div>

            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Two-Factor Authentication
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Add an extra layer of security to your account.
              </p>
            </div>
            <div className="overflow-hidden rounded bg-background-1">
              <div className="flex flex-col gap-4 p-4">
                <p className="text-sm text-content-muted">todo.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </section>
  )
}
