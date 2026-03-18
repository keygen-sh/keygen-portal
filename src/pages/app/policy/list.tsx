import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { usePolicyTableColumns } from "@/hooks/use-policy-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Policy } from "@/types/policies"

import { useListPolicies } from "@/queries/policies"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Policies from "@/components/policies"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function PoliciesList() {
  const table = useDataTable()
  const columns = usePolicyTableColumns()

  const {
    data: policies,
    links,
    isLoading: policiesLoading,
  } = useListPolicies({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Policies">
        <Button
          size="sm"
          disabled={policiesLoading}
          onClick={() => setOpen(true)}
        >
          New Policy
        </Button>

        <Policies.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Policy>
          data={policies}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={policiesLoading}
          onRowClick={(policy) => navigateToResource(policy)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={policiesLoading}
        />
      </PageFooter>
    </section>
  )
}
