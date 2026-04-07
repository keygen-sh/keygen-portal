import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useListUsers } from "@/queries/users"

import { useDataTable } from "@/hooks/use-data-table"
import { useTeamTableColumns } from "@/hooks/use-team-table-columns"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

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
  const totalUsers = links?.meta?.count

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState({ inviteTeammate: false })

  return (
    <section className="flex h-screen flex-col">
      <PageHeader>
        <div className="flex-1">
          <h1 className="font-semibold text-content-muted">Team</h1>
          {totalUsers != null && (
            <p className="text-xs text-content-subdued">
              You currently have{" "}
              <Badge className="mx-0.5 min-h-4 min-w-4 text-xs text-content-muted">
                {totalUsers}
              </Badge>{" "}
              {totalUsers === 1 ? "teammate" : "teammates"}.
            </p>
          )}
        </div>
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
          onRowClick={(user) => navigateToResource(user)}
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
