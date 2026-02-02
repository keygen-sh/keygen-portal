import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useUserTableColumns } from "@/hooks/use-user-table-columns"
import { useListUsers } from "@/queries/users"
import { User } from "@/types/users"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Users from "@/components/users"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function UsersList() {
  const { data: users = [], isLoading: usersLoading } = useListUsers()
  const columns = useUserTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section>
      <PageHeader title="Users">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={usersLoading}>
              New User
            </Button>
          </DialogTrigger>

          <Users.Create.Modal
            onSelectUser={(user) => navigateToResource(user)}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {usersLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<User>
          data={users}
          columns={columns}
          hideOnMobile={[
            "attributes.fullName",
            "attributes.role",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(user) => navigateToResource(user)}
        />
      )}
    </section>
  )
}
