import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useLicenseTableColumns } from "@/hooks/use-license-table-columns"
import { License } from "@/types/licenses"

import { useListLicenses } from "@/queries/licenses"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Licenses from "@/components/licenses"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function LicensesList() {
  const { data: licenses = [], isLoading: licensesLoading } = useListLicenses()
  const columns = useLicenseTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section>
      <PageHeader title="Licenses">
        <Button
          size="sm"
          disabled={licensesLoading}
          onClick={() => setOpen(true)}
        >
          New License
        </Button>
      </PageHeader>

      <Licenses.Form.Create open={open} onOpenChange={setOpen} />

      {licensesLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<License>
          data={licenses}
          columns={columns}
          hideOnMobile={[
            "attributes.key",
            "relationships.policy",
            "relationships.product",
            "attributes.expiry",
            "attributes.created",
          ]}
          onRowClick={(license) => navigateToResource(license)}
        />
      )}
    </section>
  )
}
