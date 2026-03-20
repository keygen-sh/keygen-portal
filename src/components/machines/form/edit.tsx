import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import {
  useGetMachine,
  useUpdateMachine,
  useChangeMachineOwner,
  useChangeMachineGroup,
} from "@/queries/machines"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Machines from "@/components/machines"

interface EditMachineFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditMachineForm({
  open,
  onOpenChange,
}: EditMachineFormProps) {
  const { id } = useParams({ from: "/$accountId/app/machines/$id" })
  const { data: machine } = useGetMachine(id)

  const updateMachine = useUpdateMachine(machine?.id ?? "")
  const changeGroup = useChangeMachineGroup()
  const changeOwner = useChangeMachineOwner()

  const form = useForm<Schemas.Machines.UpdateValues>({
    resolver: zodResolver(Schemas.Machines.UpdateSchema),
    mode: "onChange",
    values: {
      name: machine?.attributes.name ?? null,
      ip: machine?.attributes.ip ?? null,
      hostname: machine?.attributes.hostname ?? null,
      platform: machine?.attributes.platform ?? null,
      cores: machine?.attributes.cores ?? null,
      memory: machine?.attributes.memory ?? null,
      disk: machine?.attributes.disk ?? null,
      metadata: machine?.attributes.metadata ?? {},
      groupId: machine?.relationships.group?.data?.id ?? null,
      ownerId: machine?.relationships.owner?.data?.id ?? null,
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Machines.UpdateValues) => {
      if (!machine) return

      const currentOwnerId = machine.relationships.owner?.data?.id ?? null
      const newOwnerId = values.ownerId ?? null

      if (newOwnerId !== currentOwnerId) {
        await changeOwner.mutateAsync({
          machineId: machine.id,
          ownerId: newOwnerId,
        })
      }

      const currentGroupId = machine.relationships.group?.data?.id ?? null
      const newGroupId = values.groupId ?? null

      if (newGroupId !== currentGroupId) {
        await changeGroup.mutateAsync({
          machineId: machine.id,
          groupId: newGroupId,
        })
      }

      await updateMachine.mutateAsync(values)
      toast({ message: "Machine updated", variant: "success" })
      onOpenChange(false)
    },
    [machine, updateMachine, changeGroup, changeOwner, onOpenChange],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing machine"
          onSubmit={handleSubmit}
          errorMessage="Failed to update machine"
          isPending={
            updateMachine.isPending ||
            changeGroup.isPending ||
            changeOwner.isPending
          }
          submitLabel="Update"
          className="md:h-[76vh]!"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Machines.Form.Fields
                schema="edit"
                include={["cores", "disk", "hostname", "ip"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Machines.Form.Fields
                schema="edit"
                include={["memory", "name", "platform"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Machines.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />

          <Separator className="my-8" />

          <Forms.Section.Columns title="Relationships">
            <Forms.Section.Column>
              <Machines.Form.Fields
                schema="edit"
                include={["groupId"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Machines.Form.Fields
                schema="edit"
                include={["ownerId"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
