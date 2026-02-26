import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { useGetLicense, useUpdateLicense } from "@/queries/licenses"
import { useGetPolicy } from "@/queries/policies"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Licenses from "@/components/licenses"

interface EditLicenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditLicenseForm({
  open,
  onOpenChange,
}: EditLicenseFormProps) {
  const { id } = useParams({ from: "/$accountId/app/licenses/$id" })
  const { data: license } = useGetLicense(id)
  const { data: policy } = useGetPolicy(
    license?.relationships.policy?.data?.id ?? "",
  )

  const updateLicense = useUpdateLicense(license?.id ?? "")

  const form = useForm<Schemas.Licenses.UpdateValues>({
    resolver: zodResolver(Schemas.Licenses.UpdateSchema),
    mode: "onChange",
    values: {
      name: license?.attributes.name ?? "",
      expiry: license?.attributes.expiry
        ? license.attributes.expiry.slice(0, 16)
        : null,
      suspended: license?.attributes.suspended ?? false,
      protected: license?.attributes.protected ?? false,
      maxMachines: license?.attributes.maxMachines ?? null,
      maxProcesses: license?.attributes.maxProcesses ?? null,
      maxUsers: license?.attributes.maxUsers ?? null,
      maxCores: license?.attributes.maxCores ?? null,
      maxUses: license?.attributes.maxUses ?? null,
      metadata: license?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.UpdateValues) => {
      await updateLicense.mutateAsync(values)
      toast({ message: "License updated", variant: "success" })
      onOpenChange(false)
    },
    [updateLicense, onOpenChange],
  )

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing license"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          errorMessage="Failed to update license"
          isPending={updateLicense.isPending}
          submitLabel="Update"
          className="md:h-[56vh]!"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={["expiry", "maxCores", "maxMachines", "maxProcesses"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={[
                  "maxUsers",
                  "maxUses",
                  "name",
                  "protected",
                  "suspended",
                ]}
                fieldVariant="stacking"
                selectedPolicy={policy}
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Licenses.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
