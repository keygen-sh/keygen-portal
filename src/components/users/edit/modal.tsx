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
import { User, MockUsers } from "@/types/users"

import EditForm from "./edit-form"

import * as Loading from "@/components/loading"

interface UsersEditModalProps {
  open: boolean
  onClose: () => void
  user: User | null
}

export default function UsersEditModal({
  open,
  onClose,
  user,
}: UsersEditModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateUser = useCallback(
    (values: Forms.Users.UpdateValues) => {
      if (!user) return

      setLoading(true)

      const index = MockUsers.findIndex((u) => u.id === user.id)
      if (index === -1) {
        toast({ message: "User not found", variant: "error" })
        setLoading(false)
        return
      }

      const firstName =
        values.firstName !== undefined
          ? values.firstName
          : user.attributes.firstName
      const lastName =
        values.lastName !== undefined
          ? values.lastName
          : user.attributes.lastName
      const fullName =
        firstName || lastName
          ? [firstName, lastName].filter(Boolean).join(" ")
          : null

      const groupId =
        values.groupId !== undefined
          ? values.groupId
          : user.relationships.group?.data?.id

      const updated: User = {
        ...user,
        attributes: {
          ...user.attributes,
          email:
            values.email !== undefined ? values.email : user.attributes.email,
          firstName,
          lastName,
          fullName,
          role: values.role !== undefined ? values.role : user.attributes.role,
          permissions:
            values.permissions !== undefined
              ? values.permissions
              : user.attributes.permissions,
          metadata: values.metadata ?? user.attributes.metadata,
          updated: new Date().toISOString(),
        },
        relationships: {
          ...user.relationships,
          group: {
            links: {
              related: groupId
                ? `/v1/accounts/{ACCOUNT}/groups/${groupId}`
                : null,
            },
            data: groupId ? { type: "groups", id: groupId } : null,
          },
        },
      }

      MockUsers[index] = updated
      setLoading(false)
      toast({ message: "User updated", variant: "success" })
      onClose()
    },
    [user, onClose],
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
            Updating an existing user
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {!user ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : (
          open && (
            <EditForm
              user={user}
              loading={loading}
              onUpdate={handleUpdateUser}
              onCancel={onClose}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
