import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useReleaseTableColumns } from "@/hooks/use-release-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Release } from "@/types/releases"

import { useListReleases } from "@/queries/releases"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Releases from "@/components/releases"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ReleasesList() {
  const table = useDataTable()
  const columns = useReleaseTableColumns()

  const {
    data: releases,
    links,
    isLoading: releasesLoading,
  } = useListReleases({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Releases">
        <Button
          size="sm"
          disabled={releasesLoading}
          onClick={() => setOpen(true)}
        >
          New Release
        </Button>
        <Releases.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Release>
          data={releases}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={releasesLoading}
          onRowClick={(release) => navigateToResource(release)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={releasesLoading}
        />
      </PageFooter>
    </section>
  )
}
