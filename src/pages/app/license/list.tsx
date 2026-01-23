import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useLicenseTableColumns } from "@/hooks/use-license-table-columns"
import { License } from "@/types/licenses"

import { useListLicenses } from "@/queries/licenses"

import * as keygen from "@/keygen"
import * as Licenses from "@/components/licenses"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function LicensesList() {
  const { data: licenses = [], isLoading: licensesLoading } = useListLicenses()
  const columns = useLicenseTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectLicense = async (license: License | null) => {
    if (!license) return

    await navigate({
      to: "/$id/app/licenses/$licenseId",
      params: { id: keygen.config.id, licenseId: license.id },
    })
    setOpen(false)
  }

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
            onSelectLicense={(license) => handleSelectLicense(license)}
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
          onRowClick={(l) => handleSelectLicense(l)}
        />
      )}
    </section>
  )
}
