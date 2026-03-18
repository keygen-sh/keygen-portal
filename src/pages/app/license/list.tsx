import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useLicenseTableColumns } from "@/hooks/use-license-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { License } from "@/types/licenses"

import { useListLicenses } from "@/queries/licenses"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Licenses from "@/components/licenses"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LicensesList() {
  const table = useDataTable()
  const columns = useLicenseTableColumns()

  const {
    data: licenses,
    links,
    isLoading: licensesLoading,
  } = useListLicenses({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
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

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<License>
          data={licenses}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={licensesLoading}
          onRowClick={(license) => navigateToResource(license)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={licensesLoading}
        />
      </PageFooter>
    </section>
  )
}
