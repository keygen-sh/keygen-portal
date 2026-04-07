import { ScrollArea } from "@/components/ui/scroll-area"

import * as Account from "@/components/account"
import SectionCard from "@/components/section-card"
import PageHeader from "@/components/page-header"

export default function PermissionsPage() {
  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Permissions" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-6 md:px-10 md:py-8">
          <SectionCard title="Default User Permissions">
            <Account.Form.Permissions />
          </SectionCard>
        </div>
      </ScrollArea>
    </section>
  )
}
