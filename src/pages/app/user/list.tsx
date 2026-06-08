import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useUserTableColumns } from "@/hooks/use-user-table-columns"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { useDataTable } from "@/hooks/use-data-table"
import { User, UserRole, type UserFilters } from "@/types/users"

import { useListUsers } from "@/queries/users"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Users from "@/components/users"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function UsersList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const columns = useUserTableColumns()

  const [filters, setFilters] = useFilterSearch<UserFilters>({
    roles: [UserRole.User],
  })
  const { cursor, reset, goToPage } = useCursors(page, setPage)

  const handleFiltersChange = useCallback(
    (next: UserFilters) => {
      setFilters(next)
      reset()
    },
    [setFilters, reset],
  )

  const {
    data: users,
    links,
    isLoading: usersLoading,
  } = useListUsers({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Users">
        <Can.Any permissions={["user.create", "user.invite"]}>
          <Button
            size="sm"
            disabled={usersLoading}
            onClick={() => setOpen(true)}
          >
            New User
          </Button>
        </Can.Any>
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Users.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <Users.Form.Create open={open} onOpenChange={setOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<User>
          data={users}
          table={table}
          columns={columns}
          pageCount={-1}
          isLoading={usersLoading}
          onRowClick={(user) => navigateToResource(user)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={usersLoading}
        />
      </PageFooter>
    </section>
  )
}
