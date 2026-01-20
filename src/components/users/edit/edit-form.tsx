import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import * as Forms from "@/forms"
import { User, UserRole } from "@/types/users"

import * as Users from "@/components/users"
import * as Loading from "@/components/loading"
import DocumentationLink from "@/components/documentation-link"

interface EditFormProps {
  user: User
  loading?: boolean
  onUpdate: (values: Forms.Users.UpdateValues) => Promise<void> | void
  onCancel: () => void
}

export default function EditForm({
  user,
  loading,
  onUpdate,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Users.UpdateValues>({
    resolver: zodResolver(Forms.Users.UpdateSchema),
    mode: "onChange",
    defaultValues: {
      email: user.attributes.email ?? "",
      firstName: user.attributes.firstName ?? null,
      lastName: user.attributes.lastName ?? null,
      role: user.attributes.role ?? UserRole.User,
      permissions: user.attributes.permissions ?? [],
      groupId: user.relationships.group?.data?.id ?? null,
      metadata: user.attributes.metadata ?? {},
    },
  })

  const update = useCallback(
    async (values: Forms.Users.UpdateValues) => {
      await onUpdate(values)
    },
    [onUpdate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit(update)()
        }}
      >
        <ScrollArea type="always" className="h-[calc(100dvh-8rem)]">
          <Users.Fields.All />

          <DocumentationLink page="users" />
        </ScrollArea>

        <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
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
            {loading ? <Loading.Dots className="bg-background" /> : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
