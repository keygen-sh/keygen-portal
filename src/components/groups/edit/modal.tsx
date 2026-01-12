import { useCallback, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"
import { Group, MockGroups } from "@/types/groups"

import EditForm from "./edit-form"

import * as Loading from "@/components/loading"

interface GroupsEditModalProps {
  open: boolean
  onClose: () => void
  group: Group | null
}

export default function GroupsEditModal({
  open,
  onClose,
  group,
}: GroupsEditModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateGroup = useCallback(
    (values: Forms.Groups.UpdateValues) => {
      if (!group) return

      setLoading(true)

      // Mock update
      setTimeout(() => {
        const index = MockGroups.findIndex((g) => g.id === group.id)
        if (index === -1) {
          toast({ message: "Group not found", variant: "error" })
          setLoading(false)
          return
        }

        const updated: Group = {
          ...group,
          attributes: {
            ...group.attributes,
            name:
              values.name !== undefined ? values.name : group.attributes.name,
            maxUsers:
              values.maxUsers !== undefined
                ? values.maxUsers
                : group.attributes.maxUsers,
            maxLicenses:
              values.maxLicenses !== undefined
                ? values.maxLicenses
                : group.attributes.maxLicenses,
            maxMachines:
              values.maxMachines !== undefined
                ? values.maxMachines
                : group.attributes.maxMachines,
            metadata: values.metadata ?? group.attributes.metadata,
            updated: new Date().toISOString(),
          },
        }

        MockGroups[index] = updated
        setLoading(false)
        toast({ message: "Group updated", variant: "success" })
        onClose()
      }, 500)
    },
    [group, onClose],
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
        {!group ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : (
          open && (
            <EditForm
              group={group}
              loading={loading}
              onUpdate={handleUpdateGroup}
              onCancel={onClose}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
