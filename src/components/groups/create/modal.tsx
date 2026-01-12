import { useCallback, useState } from "react"
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

import { Group, MockGroups } from "@/types/groups"

import { toast } from "@/lib/toast"

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
  const [loading, setLoading] = useState(false)

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
      setLoading(true)

      setTimeout(() => {
        const newGroup: Group = {
          id: crypto.randomUUID(),
          type: "groups",
          links: {
            self: `/v1/accounts/{ACCOUNT}/groups/${crypto.randomUUID()}`,
          },
          attributes: {
            name: values.name,
            maxUsers: values.maxUsers ?? null,
            maxLicenses: values.maxLicenses ?? null,
            maxMachines: values.maxMachines ?? null,
            metadata: values.metadata ?? {},
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
          relationships: {
            account: {
              links: { related: "/v1/accounts/{ACCOUNT}" },
              data: { type: "accounts", id: "{ACCOUNT}" },
            },
            environment: {
              links: { related: null },
              data: null,
            },
            owners: {
              links: { related: null },
              data: [],
            },
            users: {
              links: { related: null },
              data: [],
            },
            licenses: {
              links: { related: null },
              data: [],
            },
            machines: {
              links: { related: null },
              data: [],
            },
          },
        }

        MockGroups.push(newGroup)
        setLoading(false)
        toast({ message: "Group created", variant: "success" })
        onSelectGroup(newGroup)
        onClose()
      }, 500)
    },
    [onSelectGroup, onClose],
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
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              {loading ? <Loading.Dots className="bg-background" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
