import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useDataTable } from "@/hooks/use-data-table"
import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useTokenTableColumns } from "@/hooks/use-token-table-columns"

import { Token, type TokenFilters, SubjectTokenRoles } from "@/types/tokens"

import { useListTokens } from "@/queries/tokens"

import * as Tokens from "@/components/tokens"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function TokensList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const columns = useTokenTableColumns()
  const navigateToResource = useResourceNavigate()

  // pre-filter to customer-related tokens, e.g. user, license
  const [filters, setFilters] = useState<TokenFilters>({
    bearerRoles: [...SubjectTokenRoles],
  })
  const { cursor, reset, goToPage } = useCursors(page, setPage)

  const [createOpen, setCreateOpen] = useState(false)

  const {
    data: tokens,
    links,
    isLoading,
  } = useListTokens({ cursor, pageSize, filters })

  const handleFiltersChange = useCallback(
    (next: TokenFilters) => {
      setFilters(next)
      reset()
    },
    [reset],
  )

  const nextCursor = cursorFromLink(links?.next)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Tokens">
        <Can permission="token.generate">
          <Button
            size="sm"
            disabled={isLoading}
            onClick={() => setCreateOpen(true)}
          >
            New Token
          </Button>
        </Can>
      </PageHeader>

      <div className="min-w-0 overflow-hidden border-b border-accent px-2 pt-2 pb-2.5 md:px-4">
        <Tokens.FilterBar filters={filters} onChange={handleFiltersChange} />
      </div>

      <Tokens.Form.Create open={createOpen} onOpenChange={setCreateOpen} />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Token>
          data={tokens}
          table={table}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(token) => navigateToResource(token)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={isLoading}
        />
      </PageFooter>
    </section>
  )
}
