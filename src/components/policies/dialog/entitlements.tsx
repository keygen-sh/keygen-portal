import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { usePagination } from "@/hooks/use-pagination"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useCursors, cursorFromLink } from "@/hooks/use-cursors"
import { useEntitlementTableColumns } from "@/hooks/use-entitlement-table-columns"

import { useListPolicyEntitlements } from "@/queries/policies"

import { Entitlement } from "@/types/entitlements"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageFooter from "@/components/page-footer"

const PAGE_SIZE = 15

interface PolicyEntitlementsDialogProps {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

export default function PolicyEntitlementsDialog({
  id,
  open,
  onOpenChange,
  title = "Policy entitlements",
}: PolicyEntitlementsDialogProps) {
  const { page, setPage } = usePagination()
  const { cursor, goToPage } = useCursors(page, setPage)

  const columns = useEntitlementTableColumns()
  const navigateToResource = useResourceNavigate()

  const {
    data: entitlements,
    links,
    isLoading,
  } = useListPolicyEntitlements(
    id,
    { cursor, pageSize: PAGE_SIZE },
    { enabled: open },
  )

  const handleNavigate = async (entitlement: Entitlement) => {
    onOpenChange(false)
    await navigateToResource(entitlement)
  }

  const nextCursor = cursorFromLink(links?.next)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen min-w-screen flex-col overflow-hidden rounded-none p-0 md:h-[calc(100dvh-16rem)] md:max-w-4xl md:min-w-auto md:rounded-md">
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
            Viewing entitlements
          </DialogDescription>
          <DialogTitle className="text-start text-sm">{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <DataTable<Entitlement>
            data={entitlements}
            pagination={{ page, pageSize: PAGE_SIZE }}
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
