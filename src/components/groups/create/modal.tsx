import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import * as Forms from "@/forms"

import { Group } from "@/types/groups"

import { toast } from "@/lib/toast"

import { useCreateGroup } from "@/queries/groups"

import * as Groups from "@/components/groups"
import * as Loading from "@/components/loading"
import DocumentationLink from "@/components/documentation-link"

interface GroupsCreateModalProps {
  onSelectGroup: (group: Group | null) => void
  onClose: () => void
}

export default function GroupsCreateModal({
  onSelectGroup,
  onClose,
}: GroupsCreateModalProps) {
  const createGroup = useCreateGroup()

  const form = useForm<Forms.Groups.CreateValues>({
    resolver: zodResolver(Forms.Groups.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      maxUsers: null,
      maxLicenses: null,
      maxMachines: null,
      metadata: {},
    },
  })

  const handleCreateGroup = useCallback(
    (values: Forms.Groups.CreateValues) => {
      createGroup.mutate(values, {
        onSuccess: (group) => {
          toast({ message: "Group created", variant: "success" })
          onSelectGroup(group)
          onClose()
        },
        onError: () => {
          toast({
            message: "Failed to create group",
            variant: "error",
          })
        },
      })
    },
    [createGroup, onSelectGroup, onClose],
  )

  return (
    <DialogContent className="min-w-fit">
      <DialogHeader className="h-fit items-start border-b border-accent p-4">
        <DialogDescription className="text-xs">
          Creating a new group
        </DialogDescription>
        <DialogTitle className="sr-only">Create Group</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateGroup)}>
          <ScrollArea className="h-[calc(100vh-11rem)] md:h-[50vh] md:w-4xl">
            <Groups.Fields.All layout="create" />

            <DocumentationLink page="groups" />
          </ScrollArea>

          <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={createGroup.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createGroup.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {createGroup.isPending ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
