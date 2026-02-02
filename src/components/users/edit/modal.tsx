import { useParams } from "@tanstack/react-router"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"

import { useGetUser, useUpdateUser } from "@/queries/users"

import EditForm from "./edit-form"
import * as Loading from "@/components/loading"

interface UsersEditModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export default function UsersEditModal({
  open,
  onOpenChange,
}: UsersEditModalProps) {
  const { id } = useParams({
    from: "/$accountId/app/users/$id",
  })
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useGetUser(id)
  const updateUser = useUpdateUser(id)

  const handleUpdateUser = (values: Forms.Users.UpdateValues) => {
    if (!user) return
    updateUser.mutate(values, {
      onSuccess: () => {
        toast({ message: "User updated", variant: "success" })
        onOpenChange(false)
      },
      onError: () =>
        toast({ message: "Failed to update user", variant: "error" }),
      onSettled() {
        if (!updateUser.isError) {
          onOpenChange(false)
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="min-h-screen min-w-screen rounded-none border-none"
      >
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
            Updating an existing user
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {userLoading ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : userError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load user.
          </p>
        ) : (
          open &&
          user && (
            <EditForm
              user={user}
              loading={updateUser.isPending}
              onUpdate={handleUpdateUser}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
