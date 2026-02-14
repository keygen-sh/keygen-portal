import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { useGetMachine, useUpdateMachine } from "@/queries/machines"

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

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit((values) => {
      updateMachine.mutate(values, {
        onSuccess: () => {
          toast({ message: "Machine updated", variant: "success" })
          onOpenChange(false)
        },
        onError: (error) => {
          toast({
            message: "Failed to update machine",
            description: error.detail,
            variant: "error",
          })
        },
      })
    })()
  }, [form, updateMachine, onOpenChange])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing machine"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={updateMachine.isPending}
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
      </Form>
    </Forms.Container.Dialog>
  )
}
