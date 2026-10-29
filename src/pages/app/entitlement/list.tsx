import { useState } from "react"

import { Button } from "@/components/ui/button"

import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { useEntitlementTableColumns } from "@/hooks/use-entitlement-table-columns"
import { Entitlement } from "@/types/entitlements"

import { useListEntitlements } from "@/queries/entitlements"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Entitlements from "@/components/entitlements"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function EntitlementsList() {
  const pagination = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = pagination
  const columns = useEntitlementTableColumns()

  const {
    data: entitlements,
    links,
    isLoading: entitlementsLoading,
  } = useListEntitlements({
    cursor,
    pageSize,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Entitlements">
        <Can permission="entitlement.create">
          <Button
            size="sm"
            disabled={entitlementsLoading}
            onClick={() => setOpen(true)}
          >
            New Entitlement
          </Button>
        </Can>
        <Entitlements.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <DataTable<Entitlement>
        data={entitlements}
        pagination={pagination}
        columns={columns}
        isLoading={entitlementsLoading}
        onRowClick={(entitlement) => navigateToResource(entitlement)}
      />

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={entitlementsLoading}
        />
      </PageFooter>
    </section>
  )
}
