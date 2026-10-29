import { useState } from "react"

import { Button } from "@/components/ui/button"

import { WebhookEndpoint } from "@/types/webhook-endpoints"

import { useListWebhookEndpoints } from "@/queries/webhook-endpoints"

import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useWebhookEndpointTableColumns } from "@/hooks/use-webhook-endpoint-table-columns"

import * as WebhookEndpoints from "@/components/webhook-endpoints"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function WebhookEndpointsList() {
  const pagination = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = pagination
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
            New Endpoint
          </Button>
        </Can>
        <WebhookEndpoints.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <DataTable<WebhookEndpoint>
        data={webhookEndpoints}
        pagination={pagination}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(webhookEndpoint) => navigateToResource(webhookEndpoint)}
      />

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
