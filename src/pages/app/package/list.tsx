import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { usePackageTableColumns } from "@/hooks/use-package-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Package } from "@/types/packages"

import { useListPackages } from "@/queries/packages"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Packages from "@/components/packages"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function PackagesList() {
  const table = useDataTable()
  const columns = usePackageTableColumns()

  const {
    data: packages,
    links,
    isLoading: packagesLoading,
  } = useListPackages({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Packages">
        <Button
          size="sm"
          disabled={packagesLoading}
          onClick={() => setOpen(true)}
        >
          New Package
        </Button>
        <Packages.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Package>
          data={packages}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={packagesLoading}
          onRowClick={(pkg) => navigateToResource(pkg)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={packagesLoading}
        />
      </PageFooter>
    </section>
  )
}
