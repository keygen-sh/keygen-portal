import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useGetAccount, useGetAccountPlan } from "@/queries/accounts"
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

  const { data: account } = useGetAccount()
  const { data: plan } = useGetAccountPlan(
    account?.relationships.plan?.data?.id,
  )

  const totalPages = links?.meta?.pages ?? 1
  const totalUsers = links?.meta?.count

  const maxAdmins = plan?.attributes.maxAdmins
  const planName = plan?.attributes.name

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState({ inviteTeammate: false })

  return (
    <section className="flex h-screen flex-col">
      <PageHeader>
        <div className="flex w-full items-center gap-3">
          <h1 className="font-semibold text-content-muted">Team</h1>
          <Separator orientation="vertical" className="mt-0.5 ml-1 min-h-4" />
          {totalUsers != null && (
            <p className="mt-0.25 text-xs text-content-subdued">
              You currently have
              <Badge className="mx-1 min-h-4 min-w-4 text-xs text-content-muted">
                {totalUsers}
              </Badge>
              {totalUsers === 1 ? "teammate" : "teammates"}.
              {plan && (
                <>
                  {" "}
                  Invite up to
                  <Badge className="mx-1 min-h-4 min-w-4 text-xs text-content-muted">
                    {maxAdmins ?? "Unlimited"}
                  </Badge>
                  while on the
                  <Badge className="mx-1 min-h-4 min-w-4 text-xs text-content-muted">
                    {planName}
                  </Badge>
                  plan.
                </>
              )}
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
