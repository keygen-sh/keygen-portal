import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import {
  useGetLicense,
  useUpdateLicense,
  useListLicenseEntitlements,
  useAttachLicenseEntitlements,
  useDetachLicenseEntitlements,
} from "@/queries/licenses"
import { useGetPolicy } from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"
import { settleMutations } from "@/queries/utils"

import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

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
  const { data: currentEntitlements = [] } = useListLicenseEntitlements(
    license?.id ?? "",
  )

  const updateLicense = useUpdateLicense(license?.id ?? "")
  const attachEntitlements = useAttachLicenseEntitlements(license?.id ?? "")
  const detachEntitlements = useDetachLicenseEntitlements(license?.id ?? "")
  const createEntitlement = useCreateEntitlement()

  const form = useForm<Schemas.Licenses.UpdateValues>({
    resolver: zodResolver(Schemas.Licenses.UpdateSchema),
    mode: "onChange",
    values: license
      ? {
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
          entitlements: {
            attach: currentEntitlements.map((e) => e.id),
            create: [],
          },
        }
      : undefined,
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.UpdateValues) => {
      if (!license) return

      const attachIds = values.entitlements?.attach ?? []
      const toCreate = values.entitlements?.create ?? []
      const [entitlements, errors] = await settleMutations<Entitlement>(
        toCreate.map((attrs) => createEntitlement.mutateAsync(attrs)),
      )
      const entitlementIds = Array.from(
        new Set([...attachIds, ...entitlements.map((e) => e.id)]),
      )

      if (errors.length > 0) {
        const nextAttach = [...entitlementIds]
        const nextCreate = errors.map(({ index }) => toCreate[index])
        form.setValue("entitlements.attach", nextAttach)
        form.setValue("entitlements.create", nextCreate)
        errors.forEach((error, index) => {
          let message = ""
          if (error.reason.code === EntitlementErrorCode.CodeTaken) {
            message = "Code already exists"
          } else {
            message = "Field is invalid"
          }
          form.setError(`entitlements.create.${index}.code`, {
            type: "validate",
            message,
          })
        })
        toast({ message: "Failed to create entitlement(s)", variant: "error" })
        return
      }

      const currentIds = currentEntitlements.map((e) => e.id)
      const newIds = entitlementIds
      const toAttach = newIds.filter((id) => !currentIds.includes(id))
      const toDetach = currentIds.filter((id) => !newIds.includes(id))

      if (toDetach.length > 0) await detachEntitlements.mutateAsync(toDetach)
      if (toAttach.length > 0) await attachEntitlements.mutateAsync(toAttach)
      await updateLicense.mutateAsync({
        ...values,
        entitlements: { attach: entitlementIds, create: [] },
      })
      toast({ message: "License updated", variant: "success" })
      onOpenChange(false)
    },
    [
      form,
      license,
      onOpenChange,
      updateLicense,
      currentEntitlements,
      attachEntitlements,
      detachEntitlements,
      createEntitlement,
    ],
  )

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing license"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          errorMessage="Failed to update license"
          isPending={
            updateLicense.isPending ||
            attachEntitlements.isPending ||
            detachEntitlements.isPending ||
            createEntitlement.isPending
          }
          submitLabel="Update"
          className="md:h-[64vh]!"
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

          <Forms.Section.Columns>
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={["entitlements.attach", "entitlements.create"]}
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
