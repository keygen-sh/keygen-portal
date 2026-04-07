import { ScrollArea } from "@/components/ui/scroll-area"

import * as Users from "@/components/users"
import PageHeader from "@/components/page-header"
import SectionCard from "@/components/section-card"

export default function SecurityPage() {
  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Security" />

      <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-6 md:px-10 md:py-8">
          <SectionCard title="Change Password">
            <Users.Form.Password />
          </SectionCard>

          <SectionCard title="Two-Factor Authentication">TODO</SectionCard>
        </div>
      </ScrollArea>
    </section>
  )
}
