import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useGroupTableColumns } from "@/hooks/use-group-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Group } from "@/types/groups"

import { useListGroups } from "@/queries/groups"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Groups from "@/components/groups"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function GroupsList() {
  const table = useDataTable()
  const columns = useGroupTableColumns()

  const {
    data: groups,
    links,
    isLoading: groupsLoading,
  } = useListGroups({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Groups">
        <Button
          size="sm"
          disabled={groupsLoading}
          onClick={() => setOpen(true)}
        >
          New Group
        </Button>
        <Groups.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <DataTable<Group>
        data={groups}
        table={table}
        columns={columns}
        pageCount={totalPages}
        isLoading={groupsLoading}
        hideOnMobile={[
          "id",
          "attributes.maxUsers",
          "attributes.maxLicenses",
          "attributes.maxMachines",
          "attributes.created",
        ]}
        onRowClick={(group) => navigateToResource(group)}
      />

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={groupsLoading || !table.isMeasured}
        />
      </PageFooter>
    </section>
  )
}
