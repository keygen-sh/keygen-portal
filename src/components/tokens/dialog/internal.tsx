import { useState, useCallback } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { useDataTable } from "@/hooks/use-data-table"
import { useCursors, cursorFromLink } from "@/hooks/use-cursors"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useTokenTableColumns } from "@/hooks/use-token-table-columns"

import { useListTokens } from "@/queries/tokens"

import { Token, type TokenFilters, InternalTokenRoles } from "@/types/tokens"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageFooter from "@/components/page-footer"
import TokenFilterBar from "../filter-bar"

interface InternalTokensDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InternalTokensDialog({
  open,
  onOpenChange,
}: InternalTokensDialogProps) {
  const table = useDataTable()
  const { page, setPage } = table
  const { cursor, reset, goToPage } = useCursors(page, setPage)
  const columns = useTokenTableColumns()
  const navigateToResource = useResourceNavigate()

  const [filters, setFilters] = useState<TokenFilters>({
    bearerRoles: [...InternalTokenRoles],
  })

  const {
    data: tokens,
    links,
    isLoading,
  } = useListTokens({ cursor, pageSize: 15, filters }, { enabled: open })

  const handleFiltersChange = useCallback(
    (next: TokenFilters) => {
      setFilters(next)
      reset()
    },
    [reset],
  )

  const handleNavigate = async (token: Token) => {
    onOpenChange(false)
    await navigateToResource(token)
  }

  const nextCursor = cursorFromLink(links?.next)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen min-w-screen flex-col overflow-hidden rounded-none p-0 md:h-[calc(100dvh-16rem)] md:max-w-4xl md:min-w-auto md:rounded-md">
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
            Viewing all internal access tokens
          </DialogDescription>
          <DialogTitle className="text-start text-sm">
            Internal access tokens
          </DialogTitle>
        </DialogHeader>

        <div className="border-b border-accent p-2">
          <TokenFilterBar filters={filters} onChange={handleFiltersChange} />
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <DataTable<Token>
            data={tokens}
            table={table}
            columns={columns}
            isLoading={isLoading}
            onRowClick={handleNavigate}
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
      </DialogContent>
    </Dialog>
  )
}
