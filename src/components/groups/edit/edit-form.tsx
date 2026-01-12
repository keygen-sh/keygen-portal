import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import * as Forms from "@/forms"
import { Group } from "@/types/groups"

import * as Groups from "@/components/groups"
import * as Loading from "@/components/loading"
import DocumentationLink from "@/components/documentation-link"

interface EditFormProps {
  group: Group
  loading?: boolean
  onUpdate: (values: Forms.Groups.UpdateValues) => Promise<void> | void
  onCancel: () => void
}

export default function EditForm({
  group,
  loading,
  onUpdate,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Groups.UpdateValues>({
    resolver: zodResolver(Forms.Groups.UpdateSchema),
    mode: "onChange",
    defaultValues: {
      name: group.attributes.name ?? "",
      maxUsers: group.attributes.maxUsers ?? null,
      maxLicenses: group.attributes.maxLicenses ?? null,
      maxMachines: group.attributes.maxMachines ?? null,
      metadata: group.attributes.metadata ?? {},
    },
  })

  const update = useCallback(
    async (values: Forms.Groups.UpdateValues) => {
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
          <Groups.Fields.All />

          <DocumentationLink page="groups" />
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
