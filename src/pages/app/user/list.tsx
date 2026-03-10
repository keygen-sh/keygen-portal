import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useUserTableColumns } from "@/hooks/use-user-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { User } from "@/types/users"

import { useListUsers } from "@/queries/users"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Users from "@/components/users"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function UsersList() {
  const table = useDataTable()
  const columns = useUserTableColumns()

  const {
    data: users,
    links,
    isLoading: usersLoading,
  } = useListUsers({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Users">
        <Button size="sm" disabled={usersLoading} onClick={() => setOpen(true)}>
          New User
        </Button>
      </PageHeader>

      <Users.Form.Create open={open} onOpenChange={setOpen} />

      <DataTable<User>
        data={users}
        table={table}
        columns={columns}
        pageCount={totalPages}
        isLoading={usersLoading}
        hideOnMobile={[
          "attributes.fullName",
          "attributes.role",
          "attributes.created",
          "attributes.updated",
        ]}
        onRowClick={(user) => navigateToResource(user)}
      />

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={usersLoading || !table.isMeasured}
        />
      </PageFooter>
    </section>
  )
}
