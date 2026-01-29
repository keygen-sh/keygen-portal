import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={licensesLoading}>
              New License
            </Button>
          </DialogTrigger>

          <Licenses.Create.Modal
            onSelectLicense={(license) =>
              navigateToResource(license, "license")
            }
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

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
          onRowClick={(license) => navigateToResource(license, "license")}
        />
      )}
    </section>
  )
}
