import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { usePolicyTableColumns } from "@/hooks/use-policy-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useFilterSearch } from "@/hooks/use-filter-search"
import { Policy } from "@/types/policies"

import { useListPolicies, type PolicyFilters } from "@/queries/policies"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Policies from "@/components/policies"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function PoliciesList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const columns = usePolicyTableColumns()

  const [filters, setFilters] = useFilterSearch<PolicyFilters>()
  const { cursor, reset, goToPage } = useCursors(page, setPage)

  const handleFiltersChange = useCallback(
    (next: PolicyFilters) => {
      setFilters(next)
      reset()
    },
    [setFilters, reset],
  )

  const {
    data: policies,
    links,
    isLoading: policiesLoading,
  } = useListPolicies({
    cursor,
    pageSize,
    filters,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Policies">
        <Can permission="policy.create">
          <Button
            size="sm"
            disabled={policiesLoading}
            onClick={() => setOpen(true)}
          >
            New Policy
          </Button>
        </Can>

        <Policies.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Policies.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Policy>
          data={policies}
          table={table}
          columns={columns}
          isLoading={policiesLoading}
          onRowClick={(policy) => navigateToResource(policy)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={policiesLoading}
        />
      </PageFooter>
    </section>
  )
}
