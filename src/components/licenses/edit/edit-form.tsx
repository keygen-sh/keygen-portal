import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import * as Forms from "@/forms"
import { License } from "@/types/licenses"

import * as Licenses from "@/components/licenses"
import * as Loading from "@/components/loading"
import DocumentationLink from "@/components/documentation-link"

interface EditFormProps {
  license: License
  loading?: boolean
  onUpdate: (values: Forms.Licenses.UpdateValues) => Promise<void> | void
  onCancel: () => void
}

export default function EditForm({
  license,
  loading,
  onUpdate,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Licenses.UpdateValues>({
    resolver: zodResolver(Forms.Licenses.UpdateSchema),
    mode: "onChange",
    defaultValues: {
      name: license.attributes.name ?? "",
      expiry: license.attributes.expiry
        ? license.attributes.expiry.slice(0, 16)
        : null,
      suspended: license.attributes.suspended ?? false,
      protected: license.attributes.protected ?? false,
      maxMachines: license.attributes.maxMachines ?? null,
      maxProcesses: license.attributes.maxProcesses ?? null,
      maxUsers: license.attributes.maxUsers ?? null,
      maxCores: license.attributes.maxCores ?? null,
      maxUses: license.attributes.maxUses ?? null,
      metadata: license.attributes.metadata ?? {},
    },
  })

  const update = useCallback(
    async (values: Forms.Licenses.UpdateValues) => {
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
          <Licenses.Fields.All />

          <DocumentationLink page="licenses" />
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
