import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import * as Forms from "@/forms"
import { Machine } from "@/types/machines"

import * as Machines from "@/components/machines"
import * as Loading from "@/components/loading"
import DocumentationLink from "@/components/documentation-link"

interface EditFormProps {
  machine: Machine
  loading?: boolean
  onUpdate: (values: Forms.Machines.UpdateValues) => Promise<void> | void
  onCancel: () => void
}

export default function EditForm({
  machine,
  loading,
  onUpdate,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Machines.UpdateValues>({
    resolver: zodResolver(Forms.Machines.UpdateSchema),
    mode: "onChange",
    defaultValues: {
      name: machine.attributes.name ?? null,
      ip: machine.attributes.ip ?? null,
      hostname: machine.attributes.hostname ?? null,
      platform: machine.attributes.platform ?? null,
      cores: machine.attributes.cores ?? null,
      memory: machine.attributes.memory ?? null,
      disk: machine.attributes.disk ?? null,
      metadata: machine.attributes.metadata ?? {},
      groupId: machine.relationships.group?.data?.id ?? null,
      ownerId: machine.relationships.owner?.data?.id ?? null,
    },
  })

  const update = useCallback(
    async (values: Forms.Machines.UpdateValues) => {
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
          <Machines.Fields.All />

          <DocumentationLink page="machines" />
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
