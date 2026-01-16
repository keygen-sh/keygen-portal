import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import * as Forms from "@/forms"
import { Process } from "@/types/processes"

import * as Loading from "@/components/loading"
import * as Processes from "@/components/processes"
import DocumentationLink from "@/components/documentation-link"

interface EditFormProps {
  process: Process
  loading?: boolean
  onUpdate: (values: Forms.Processes.UpdateValues) => Promise<void> | void
  onCancel: () => void
}

export default function EditForm({
  process,
  loading,
  onUpdate,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Processes.UpdateValues>({
    resolver: zodResolver(Forms.Processes.UpdateSchema),
    mode: "onChange",
    defaultValues: {
      metadata: process.attributes.metadata ?? {},
    },
  })

  const update = useCallback(
    async (values: Forms.Processes.UpdateValues) => {
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
          <Processes.Fields.All />

          <DocumentationLink page="processes" />
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
