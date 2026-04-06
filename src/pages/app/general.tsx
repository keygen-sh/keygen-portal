import { ScrollArea } from "@/components/ui/scroll-area"

import { useGetAccount } from "@/queries/accounts"

import { copyToClipboard } from "@/lib/clipboard"

import * as Users from "@/components/users"
import * as Account from "@/components/account"
import * as Attribute from "@/components/attribute"
import PageHeader from "@/components/page-header"
import ClipboardButton from "@/components/clipboard-button"

export default function General() {
  const { data: account } = useGetAccount()

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="General" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center space-y-6 px-4 py-6 md:px-10 md:py-8">
          <div className="grid grid-cols-1 md:w-2/3 md:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Account
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Manage account settings and information.
              </p>
            </div>
            <div className="rounded bg-background-1 p-4">
              {account && (
                <>
                  <Attribute.Field
                    label="ID"
                    variant="none"
                    value={
                      <ClipboardButton
                        value={account.id}
                        truncate={false}
                        onClick={() => copyToClipboard(account.id)}
                        className="w-fit"
                      />
                    }
                  />

                  <Account.Form.Edit />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:w-2/3 md:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <h2 className="font-owners-wide text-lg text-content-loud">
                Current User
              </h2>
              <p className="font-owners-text text-sm text-content-muted">
                Manage current user settings and information.
              </p>
            </div>
            <div className="rounded bg-background-1 p-4">
              <Users.Form.Profile />
            </div>
          </div>
        </div>
      </ScrollArea>
    </section>
  )
}
