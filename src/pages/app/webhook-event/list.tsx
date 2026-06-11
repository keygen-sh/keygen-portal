import { ScrollArea } from "@/components/ui/scroll-area"

import { WebhookEvent } from "@/types/webhook-events"

import { useListWebhookEvents } from "@/queries/webhook-events"

import { useDataTable } from "@/hooks/use-data-table"
import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useWebhookEventTableColumns } from "@/hooks/use-webhook-event-table-columns"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function WebhookEventsList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useWebhookEventTableColumns()

  const {
    data: webhookEvents,
    links,
    isLoading,
  } = useListWebhookEvents({ cursor, pageSize })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Webhook Events" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<WebhookEvent>
          data={webhookEvents}
          table={table}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(webhookEvent) => navigateToResource(webhookEvent)}
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
