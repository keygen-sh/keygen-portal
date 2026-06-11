import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { WebhookEndpoint } from "@/types/webhook-endpoints"

import { useListWebhookEndpoints } from "@/queries/webhook-endpoints"

import { useDataTable } from "@/hooks/use-data-table"
import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useWebhookEndpointTableColumns } from "@/hooks/use-webhook-endpoint-table-columns"

import * as WebhookEndpoints from "@/components/webhook-endpoints"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function WebhookEndpointsList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useWebhookEndpointTableColumns()

  const {
    data: webhookEndpoints,
    links,
    isLoading,
  } = useListWebhookEndpoints({ cursor, pageSize })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Webhook Endpoints">
        <Can permission="webhook-endpoint.create">
          <Button size="sm" disabled={isLoading} onClick={() => setOpen(true)}>
            New Webhook Endpoint
          </Button>
        </Can>
        <WebhookEndpoints.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<WebhookEndpoint>
          data={webhookEndpoints}
          table={table}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(webhookEndpoint) => navigateToResource(webhookEndpoint)}
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
