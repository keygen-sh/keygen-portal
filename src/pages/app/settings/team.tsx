import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useListUsers } from "@/queries/users"

import { useDataTable } from "@/hooks/use-data-table"
import { useTeamTableColumns } from "@/hooks/use-team-table-columns"

import { User } from "@/types/users"

import InviteTeammateForm from "@/components/settings/form/invite-teammate"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"
import Pagination from "@/components/pagination"

export default function TeamPage() {
  const table = useDataTable()
  const columns = useTeamTableColumns()
  const {
    data: users,
    links,
    isLoading: usersLoading,
  } = useListUsers({ page: table.page, pageSize: table.pageSize })

  const totalPages = links?.meta?.pages ?? 1

  const [open, setOpen] = useState({ inviteTeammate: false })

  return (
    <section className="flex h-screen flex-col">
      <PageHeader>
        <h1 className="flex-1 font-semibold text-content-muted">Team</h1>
        <Button size="sm" onClick={() => setOpen({ inviteTeammate: true })}>
          Invite Teammate
        </Button>
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<User>
          data={users}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={usersLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={usersLoading}
        />
      </PageFooter>
      <InviteTeammateForm
        open={open.inviteTeammate}
        onOpenChange={(value) => setOpen({ inviteTeammate: value })}
      />
    </section>
  )
}
