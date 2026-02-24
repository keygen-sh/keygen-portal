import PageHeader from "@/components/page-header"
import * as Chart from "@/components/chart"

export default function Dashboard() {
  return (
    <section>
      <PageHeader title="Metrics" />

      <div className="space-y-6 p-4 md:p-6">
        <Chart.LicenseExpirationHeatmap />
      </div>
    </section>
  )
}
