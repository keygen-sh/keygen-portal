import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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

  const handleSubmit = useCallback(
    async (values: Schemas.Processes.CreateValues) => {
      const process = await createProcess.mutateAsync(values)
      toast({ message: "Process spawned", variant: "success" })
      onOpenChange(false)
      await navigateToResource(process)
    },
    [createProcess, navigateToResource, onOpenChange],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createProcess.isPending}
          submitLabel="Spawn"
          description="Spawning a new process"
          errorMessage="Failed to spawn process"
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
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
