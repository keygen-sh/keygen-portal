import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { useCreateProcess } from "@/queries/processes"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Processes from "@/components/processes"
import DocumentationLink from "@/components/documentation-link"

interface CreateProcessFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateProcessForm({
  open,
  onOpenChange,
}: CreateProcessFormProps) {
  const form = useForm<Schemas.Processes.CreateValues>({
    resolver: zodResolver(Schemas.Processes.CreateSchema),
    mode: "onChange",
    defaultValues: {
      pid: "",
      metadata: {},
      machineId: "",
    },
  })
  const createProcess = useCreateProcess()
  const navigateToResource = useResourceNavigate()

  const handleCreateProcess = useCallback(
    (values: Schemas.Processes.CreateValues) => {
      createProcess.mutate(values, {
        onSuccess: async (process) => {
          toast({ message: "Process spawned", variant: "success" })
          onOpenChange(false)
          await navigateToResource(process)
        },
        onError: (error) => {
          toast({
            message: "Failed to spawn process",
            description: error.detail,
            variant: "error",
          })
        },
      })
    },
    [createProcess, navigateToResource, onOpenChange],
  )

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit(handleCreateProcess)()
  }, [form, handleCreateProcess])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createProcess.isPending}
          submitLabel="Spawn"
          description="Spawning a new process"
        >
          <Forms.Section.Step
            crumb="Process attributes"
            fields={["pid", "machineId", "metadata"]}
          >
            <Forms.Field.Title>
              <Processes.Form.Fields
                schema="create"
                include={["pid"]}
                titleVariant
                autoFocus="pid"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Process attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Processes.Form.Fields
                    schema="create"
                    include={["machineId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Processes.Form.Fields
                    schema="create"
                    include={["metadata"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="processes" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Form>
    </Forms.Container.Dialog>
  )
}
