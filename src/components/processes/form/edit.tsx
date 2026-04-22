import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"

import * as Schemas from "@/schemas"
import { useGetProcess, useUpdateProcess } from "@/queries/processes"

import { toast } from "@/lib/toast"
import { typedZodResolver } from "@/lib/form"
import { recordToPairs } from "@/schemas/metadata"

import * as Forms from "@/components/forms"
import * as Processes from "@/components/processes"

interface EditProcessFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditProcessForm({
  open,
  onOpenChange,
}: EditProcessFormProps) {
  const { id } = useParams({ from: "/$accountId/app/processes/$id" })
  const { data: process } = useGetProcess(id)

  const updateProcess = useUpdateProcess(process?.id ?? "")

  const form = useForm<
    Schemas.Processes.UpdateInputValues,
    unknown,
    Schemas.Processes.UpdateValues
  >({
    resolver: typedZodResolver(Schemas.Processes.UpdateSchema),
    mode: "onChange",
    values: {
      metadata: recordToPairs(process?.attributes.metadata),
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Processes.UpdateValues) => {
      await updateProcess.mutateAsync(values)
      toast({ message: "Process updated", variant: "success" })
    },
    [updateProcess],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing process"
          onSubmit={handleSubmit}
          errorMessage="Failed to update process"
          isPending={updateProcess.isPending}
          submitLabel="Update"
        >
          <Processes.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
