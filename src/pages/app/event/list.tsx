import { ScrollArea } from "@/components/ui/scroll-area"

import { Event } from "@/types/events"

import { useListEvents } from "@/queries/events"

import { useDataTable } from "@/hooks/use-data-table"
import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useEventTableColumns } from "@/hooks/use-event-table-columns"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function EventsList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useEventTableColumns()

  const { data: events, links, isLoading } = useListEvents({ cursor, pageSize })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Webhook Events" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Event>
          data={events}
          table={table}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(event) => navigateToResource(event)}
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
