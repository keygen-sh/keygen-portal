import { useState } from "react"

import { Button } from "@/components/ui/button"

import { useEntitlementTableColumns } from "@/hooks/use-entitlement-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Entitlement } from "@/types/entitlements"

import { useListEntitlements } from "@/queries/entitlements"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Entitlements from "@/components/entitlements"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function EntitlementsList() {
  const table = useDataTable()
  const columns = useEntitlementTableColumns()

  const {
    data: entitlements,
    links,
    isLoading: entitlementsLoading,
  } = useListEntitlements({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Entitlements">
        <Button
          size="sm"
          disabled={entitlementsLoading}
          onClick={() => setOpen(true)}
        >
          New Entitlement
        </Button>
        <Entitlements.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <DataTable<Entitlement>
        data={entitlements}
        table={table}
        columns={columns}
        pageCount={totalPages}
        isLoading={entitlementsLoading}
        hideOnMobile={[
          "attributes.id",
          "attributes.code",
          "attributes.url",
          "attributes.created",
          "attributes.updated",
        ]}
        onRowClick={(entitlement) => navigateToResource(entitlement)}
      />

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={entitlementsLoading || !table.isMeasured}
        />
      </PageFooter>
    </section>
  )
}
