import { useState, useCallback, useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useListUsers } from "@/queries/users"
import { useGetAccount, useGetAccountPlan } from "@/queries/accounts"

import { useMobile } from "@/hooks/use-mobile"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { usePermissions } from "@/hooks/use-permissions"
import { useTeamTableColumns } from "@/hooks/use-team-table-columns"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { User, UserRole, InternalRoles, type UserFilters } from "@/types/users"

import * as Users from "@/components/users"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"
import Pagination from "@/components/pagination"

export default function TeamPage() {
  const isMobile = useMobile()

  const table = useDataTable()
  const columns = useTeamTableColumns()
  const { can } = usePermissions()

  const [filters, setFilters] = useFilterSearch<UserFilters>()

  const handleFiltersChange = useCallback(
    (next: UserFilters) => {
      setFilters(next)
      table.setPage(1)
    },
    [table, setFilters],
  )

  // NB(cazden) API requires 'admin.read' whenever an admin appears in the response,
  // remove it from the request if current user can't read admins to avoid 403.
  const requestRoles = useMemo(
    () =>
      (filters.roles?.length ? filters.roles : InternalRoles).filter(
        (r) => can("admin.read") || (r as UserRole) !== UserRole.Admin,
      ),
    [filters.roles, can],
  )

  const {
    data: users,
    links,
    isLoading: usersLoading,
  } = useListUsers({
    page: table.page,
    pageSize: table.pageSize,
    filters: {
      ...filters,
      roles: requestRoles,
    },
  })

  const { data: account } = useGetAccount()
  const { data: plan } = useGetAccountPlan(
    account?.relationships.plan?.data?.id,
  )

  const totalPages = links?.meta?.pages ?? 1
  const totalUsers = links?.meta?.count

  const maxAdmins = plan?.attributes?.maxAdmins
  const planName = plan?.attributes?.name

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState({ inviteTeammate: false })

  return (
    <section className="flex h-screen flex-col">
      <PageHeader>
        <div className="flex w-full items-center gap-3">
          <h1 className="font-semibold text-content-muted">Team</h1>
          <Separator orientation="vertical" className="mt-0.5 ml-1 min-h-4" />
          {totalUsers != null && !isMobile && (
            <p className="mt-0.25 text-sm text-content-subdued">
              You currently have
              <Badge className="mx-1.5 min-h-4 min-w-4 text-xs text-content-muted">
                {totalUsers}
              </Badge>
              {totalUsers === 1 ? "teammate" : "teammates"}.
              {plan && (
                <>
                  {" "}
                  Invite up to
                  <Badge className="mx-1.5 min-h-4 min-w-4 text-xs text-content-muted">
                    {maxAdmins ?? "Unlimited"}
                  </Badge>
                  while on the
                  <Badge className="mx-1.5 min-h-4 min-w-4 text-xs text-content-muted">
                    {planName}
                  </Badge>
                  tier.
                </>
              )}
            </p>
          )}
        </div>
        <Can permission="admin.invite">
          <Button size="sm" onClick={() => setOpen({ inviteTeammate: true })}>
            Invite Teammate
          </Button>
        </Can>
      </PageHeader>

      {/* Mobile */}
      {totalUsers != null && isMobile && (
        <div className="flex min-w-0 flex-col border-b border-accent p-2 text-sm text-content-subdued">
          <span>
            You currently have
            <Badge className="mx-1.5 min-h-4 min-w-4 text-xs text-content-muted">
              {totalUsers}
            </Badge>
            {totalUsers === 1 ? "teammate" : "teammates"}.
          </span>
          {plan && (
            <span>
              {" "}
              Invite up to
              <Badge className="mx-1.5 min-h-4 min-w-4 text-xs text-content-muted">
                {maxAdmins ?? "Unlimited"}
              </Badge>
              while on the
              <Badge className="mx-1.5 min-h-4 min-w-4 text-xs text-content-muted">
                {planName}
              </Badge>
              tier.
            </span>
          )}
        </div>
      )}

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-3 md:p-2.5 md:px-4">
        <Users.TeamFilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

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
      <Users.Form.Invite
        open={open.inviteTeammate}
        onOpenChange={(value) => setOpen({ inviteTeammate: value })}
      />
    </section>
  )
}
