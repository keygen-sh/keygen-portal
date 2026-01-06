import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useLicenseTableColumns } from "@/hooks/use-license-table-columns"
import { License, MockLicenses } from "@/types/licenses"

import * as keygen from "@/keygen"
import * as Licenses from "@/components/licenses"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function LicensesList() {
  const [licensesLoading, setLicensesLoading] = useState(true)
  const columns = useLicenseTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectLicense = async (license: License | null) => {
    if (!license) return

    await navigate({
      to: "/$id/app/licenses/$licenseId",
      params: { id: keygen.config.id, licenseId: license.id },
    })
  }

  // Mock API call
  useEffect(() => {
    setTimeout(() => {
      setLicensesLoading(false)
    }, 1000)
  }, [])

  return (
    <section>
      <PageHeader title="Licenses">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={licensesLoading}>
              Create License
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
          data={MockLicenses}
          columns={columns}
          hideOnMobile={[
            "id",
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
