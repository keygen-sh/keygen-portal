import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useUserTableColumns } from "@/hooks/use-user-table-columns"
import { User, MockUsers } from "@/types/users"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Users from "@/components/users"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function UsersList() {
  const [usersLoading, setUsersLoading] = useState(true)
  const columns = useUserTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  // Mock API call
  useEffect(() => {
    setTimeout(() => {
      setUsersLoading(false)
    }, 300)
  }, [])

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
            onSelectUser={(user) => navigateToResource(user, "user")}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {usersLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<User>
          data={MockUsers}
          columns={columns}
          hideOnMobile={[
            "attributes.fullName",
            "attributes.role",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(user) => navigateToResource(user, "user")}
        />
      )}
    </section>
  )
}
