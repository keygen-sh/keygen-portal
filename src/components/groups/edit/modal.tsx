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

import { useGetGroup, useUpdateGroup } from "@/queries/groups"

import EditForm from "./edit-form"
import * as Loading from "@/components/loading"

interface GroupsEditModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export default function GroupsEditModal({
  open,
  onOpenChange,
}: GroupsEditModalProps) {
  const { groupId } = useParams({ from: "/$id/app/groups/$groupId" })
  const {
    data: group,
    isLoading: groupLoading,
    isError: groupError,
  } = useGetGroup(groupId)
  const updateGroup = useUpdateGroup(groupId)

  const handleUpdateGroup = (values: Forms.Groups.UpdateValues) => {
    if (!group) return
    updateGroup.mutate(values, {
      onSuccess: () => {
        toast({ message: "Group updated", variant: "success" })
        onOpenChange(false)
      },
      onError: () =>
        toast({ message: "Failed to update group", variant: "error" }),
      onSettled() {
        if (!updateGroup.isError) {
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
            Updating an existing group
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {groupLoading ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : groupError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load group.
          </p>
        ) : (
          open &&
          group && (
            <EditForm
              group={group}
              loading={updateGroup.isPending}
              onUpdate={handleUpdateGroup}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
