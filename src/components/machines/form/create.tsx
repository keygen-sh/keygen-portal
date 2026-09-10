import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import {
  useCreateMachine,
  useChangeMachineOwner,
  useChangeMachineGroup,
} from "@/queries/machines"

import { settleRelationships } from "@/lib/relationships"

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
  const form = useForm<
    Schemas.Machines.CreateFormValues,
    unknown,
    Schemas.Machines.CreateValues
  >({
    resolver: zodResolver(Schemas.Machines.CreateSchema),
    mode: "onChange",
    defaultValues: {
      fingerprint: "",
      name: null,
      licenseId: "",
      groupId: null,
      ip: null,
      hostname: null,
      platform: null,
      cores: null,
      memory: null,
      disk: null,
      metadata: [],
      ownerId: null,
    },
  })
  const createMachine = useCreateMachine()
  const changeGroup = useChangeMachineGroup()
  const changeOwner = useChangeMachineOwner()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Machines.CreateValues) => {
      const machine = await createMachine.mutateAsync(values)

      const { ownerId, groupId } = values

      await settleRelationships({
        message: "Machine activated",
        steps: [
          ownerId && {
            failure: "the owner could not be assigned",
            run: () =>
              changeOwner.mutateAsync({ machineId: machine.id, ownerId }),
          },
          groupId && {
            failure: "the group could not be assigned",
            run: () =>
              changeGroup.mutateAsync({ machineId: machine.id, groupId }),
          },
        ],
      })

      await navigateToResource(machine)
    },
    [createMachine, changeGroup, changeOwner, navigateToResource],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={
            createMachine.isPending ||
            changeGroup.isPending ||
            changeOwner.isPending
          }
          submitLabel="Activate"
          description="Activating a new machine"
          errorMessage="Failed to activate machine"
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
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
