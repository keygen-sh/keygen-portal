import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useGroupTableColumns } from "@/hooks/use-group-table-columns"
import { useListGroups } from "@/queries/groups"
import { Group } from "@/types/groups"

import * as keygen from "@/keygen"
import * as Groups from "@/components/groups"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function GroupsList() {
  const { data: groups = [], isLoading: groupsLoading } = useListGroups()
  const columns = useGroupTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectGroup = async (group: Group | null) => {
    if (!group) return

    await navigate({
      to: "/$id/app/groups/$groupId",
      params: { id: keygen.config.id, groupId: group.id },
    })
  }

  return (
    <section>
      <PageHeader title="Groups">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={groupsLoading}>
              New Group
            </Button>
          </DialogTrigger>

          <Groups.Create.Modal
            onSelectGroup={(group) => handleSelectGroup(group)}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {groupsLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Group>
          data={groups}
          columns={columns}
          hideOnMobile={[
            "id",
            "attributes.maxUsers",
            "attributes.maxLicenses",
            "attributes.maxMachines",
            "attributes.created",
          ]}
          onRowClick={(g) => handleSelectGroup(g)}
        />
      )}
    </section>
  )
}
