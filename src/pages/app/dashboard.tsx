import PageHeader from "@/components/page-header"
import * as Analytics from "@/components/analytics"

export default function Dashboard() {
  return (
    <section>
      <PageHeader title="Metrics" />

      <div className="space-y-6 p-4 md:p-6">
        <Analytics.Dashboard />
      </div>
    </section>
  )
}
