import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cursorFromLink, useCursorSearch } from "@/hooks/use-cursors"
import { useGroupTableColumns } from "@/hooks/use-group-table-columns"
import { Group } from "@/types/groups"

import { useListGroups } from "@/queries/groups"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Groups from "@/components/groups"
import Can from "@/components/can"
import DataTable from "@/components/data-table"
import Pagination from "@/components/pagination"
import PageHeader from "@/components/page-header"
import PageFooter from "@/components/page-footer"

export default function GroupsList() {
  const pagination = useCursorSearch()
  const { page, pageSize, cursor, goToPage } = pagination
  const columns = useGroupTableColumns()

  const {
    data: groups,
    links,
    isLoading: groupsLoading,
  } = useListGroups({
    cursor,
    pageSize,
  })

  const nextCursor = cursorFromLink(links?.next)

  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section className="flex h-screen flex-col">
      <PageHeader title="Groups">
        <Can permission="group.create">
          <Button
            size="sm"
            disabled={groupsLoading}
            onClick={() => setOpen(true)}
          >
            New Group
          </Button>
        </Can>
        <Groups.Form.Create open={open} onOpenChange={setOpen} />
      </PageHeader>

      <ScrollArea className="h-[calc(100vh-7rem)] overflow-auto">
        <DataTable<Group>
          data={groups}
          pagination={pagination}
          columns={columns}
          isLoading={groupsLoading}
          onRowClick={(group) => navigateToResource(group)}
        />
      </ScrollArea>

      <PageFooter>
        <Pagination
          page={page}
          hasNext={!!nextCursor}
          onPageChange={(nextPage) => goToPage(nextPage, nextCursor)}
          isLoading={groupsLoading}
        />
      </PageFooter>
    </section>
  )
}
