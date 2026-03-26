import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useArtifactTableColumns } from "@/hooks/use-artifact-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Artifact } from "@/types/artifacts"

import { useListArtifacts } from "@/queries/artifacts"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Artifacts from "@/components/artifacts"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ArtifactsList() {
  const table = useDataTable()
  const columns = useArtifactTableColumns()

  const {
    data: artifacts,
    links,
    isLoading: artifactsLoading,
  } = useListArtifacts({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Artifacts">
        <Button
          size="sm"
          disabled={artifactsLoading}
          onClick={() => setOpen(true)}
        >
          New Artifact
        </Button>
        <Artifacts.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Artifact>
          data={artifacts}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={artifactsLoading}
          onRowClick={(artifact) => navigateToResource(artifact)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={artifactsLoading}
        />
      </PageFooter>
    </section>
  )
}
