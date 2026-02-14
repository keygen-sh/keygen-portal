import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { useGetProcess, useUpdateProcess } from "@/queries/processes"

import { toast } from "@/lib/toast"

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

  const form = useForm<Schemas.Processes.UpdateValues>({
    resolver: zodResolver(Schemas.Processes.UpdateSchema),
    mode: "onChange",
    values: {
      metadata: process?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit((values) => {
      updateProcess.mutate(values, {
        onSuccess: () => {
          toast({ message: "Process updated", variant: "success" })
          onOpenChange(false)
        },
        onError: (error) => {
          toast({
            message: "Failed to update process",
            description: error.detail,
            variant: "error",
          })
        },
      })
    })()
  }, [form, updateProcess, onOpenChange])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing process"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={updateProcess.isPending}
          submitLabel="Update"
        >
          <Processes.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
