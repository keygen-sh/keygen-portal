import { ScrollArea } from "@/components/ui/scroll-area"

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
  const columns = useChannelTableColumns()

  const {
    data: channels,
    links,
    isLoading: channelsLoading,
  } = useListChannels({
    page: table.page,
    pageSize: table.pageSize,
  })

  const totalPages = links?.meta?.pages ?? 1

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Channels" />

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Channel>
          data={channels}
          table={table}
          columns={columns}
          pageCount={totalPages}
          isLoading={channelsLoading}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={table.page}
          pageCount={totalPages}
          onPageChange={table.setPage}
          isLoading={channelsLoading}
        />
      </PageFooter>
    </section>
  )
}
