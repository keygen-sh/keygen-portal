import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useEntitlementTableColumns } from "@/hooks/use-entitlement-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
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
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
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

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Entitlement>
          data={entitlements}
          table={table}
          columns={columns}
          pageCount={-1}
          isLoading={entitlementsLoading}
          onRowClick={(entitlement) => navigateToResource(entitlement)}
        />
      </ScrollArea>

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
