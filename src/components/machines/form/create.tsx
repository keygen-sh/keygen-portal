import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { MachineErrorCode } from "@/types/machines"
import { useCreateMachine } from "@/queries/machines"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Machines from "@/components/machines"
import DocumentationLink from "@/components/documentation-link"

interface CreateMachineFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateMachineForm({
  open,
  onOpenChange,
}: CreateMachineFormProps) {
  const form = useForm<Schemas.Machines.CreateValues>({
    resolver: zodResolver(Schemas.Machines.CreateSchema),
    mode: "onChange",
    defaultValues: {
      fingerprint: "",
      name: null,
      licenseId: "",
      groupId: null,
      ownerId: null,
      ip: null,
      hostname: null,
      platform: null,
      cores: null,
      memory: null,
      disk: null,
      metadata: {},
    },
  })
  const createMachine = useCreateMachine()
  const navigateToResource = useResourceNavigate()

  const handleCreateMachine = useCallback(
    (values: Schemas.Machines.CreateValues) => {
      createMachine.mutate(values, {
        onSuccess: async (machine) => {
          toast({ message: "Machine activated", variant: "success" })
          onOpenChange(false)
          await navigateToResource(machine)
        },
        onError: (error) => {
          if (error.code === MachineErrorCode.MachineLimitExceeded) {
            form.setError("licenseId", {
              type: "manual",
              message: "Machine limit exceeded for this license",
            })
          }

          toast({
            message: "Failed to activate machine",
            description: error.detail,
            variant: "error",
          })
        },
      })
    },
    [createMachine, navigateToResource, onOpenChange, form],
  )

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit(handleCreateMachine)()
  }, [form, handleCreateMachine])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createMachine.isPending}
          submitLabel="Activate"
          description="Activating a new machine"
        >
          <Forms.Section.Step
            crumb="General attributes"
            fields={["name", "fingerprint", "licenseId"]}
          >
            <Forms.Field.Title>
              <Machines.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="General attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Machines.Form.Fields
                    schema="create"
                    include={["fingerprint"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Machines.Form.Fields
                    schema="create"
                    include={["licenseId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="machines" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Hardware attributes"
            fields={["ip", "hostname", "platform", "cores", "memory", "disk"]}
          >
            <Forms.Section.Card title="Hardware attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Machines.Form.Fields
                    schema="create"
                    include={["ip", "hostname", "platform"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Machines.Form.Fields
                    schema="create"
                    include={["cores", "memory", "disk"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="machines" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Additional configuration"
            fields={["groupId", "ownerId", "metadata"]}
          >
            <Forms.Section.Card title="Additional configuration">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Machines.Form.Fields
                    schema="create"
                    include={["groupId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Machines.Form.Fields
                    schema="create"
                    include={["ownerId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
              <Machines.Form.Fields
                schema="create"
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="machines" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Form>
    </Forms.Container.Dialog>
  )
}
