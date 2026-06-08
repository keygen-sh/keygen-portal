import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursors } from "@/hooks/use-cursors"
import { useChannelTableColumns } from "@/hooks/use-channel-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Channel } from "@/types/channels"

import { useListChannels } from "@/queries/channels"

import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function ChannelsList() {
  const table = useDataTable()
  const { page, pageSize, setPage } = table
  const { cursor, goToPage } = useCursors(page, setPage)
  const columns = useChannelTableColumns()

  const {
    data: channels,
    links,
    isLoading: channelsLoading,
  } = useListChannels({
    cursor,
    pageSize,
  })

  const nextCursor = cursorFromLink(links?.next)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Channels" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Channel>
          data={channels}
          table={table}
          columns={columns}
          isLoading={channelsLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={channelsLoading}
        />
      </PageFooter>
    </section>
  )
}
