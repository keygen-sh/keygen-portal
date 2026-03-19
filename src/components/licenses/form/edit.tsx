import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import {
  useGetLicense,
  useUpdateLicense,
  useListLicenseUsers,
  useAttachLicenseUsers,
  useDetachLicenseUsers,
  useListLicenseEntitlements,
  useAttachLicenseEntitlements,
  useDetachLicenseEntitlements,
} from "@/queries/licenses"
import { useGetPolicy } from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"

import { toast } from "@/lib/toast"
import { settleCreateEntitlements } from "@/lib/entitlements"

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
  const { data: licenseEntitlements = [] } = useListLicenseEntitlements(
    license?.id ?? "",
  )
  const { data: licenseUsers = [] } = useListLicenseUsers(license?.id ?? "")

  const updateLicense = useUpdateLicense(license?.id ?? "")
  const attachUsers = useAttachLicenseUsers()
  const detachUsers = useDetachLicenseUsers()
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachLicenseEntitlements()
  const detachEntitlements = useDetachLicenseEntitlements()

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
            attach: licenseEntitlements.map((e) => e.id),
            create: [],
          },
          users: {
            attach: licenseUsers.map((u) => u.id),
          },
        }
      : undefined,
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.UpdateValues) => {
      if (!license) return

      const createdEntitlementIds = await settleCreateEntitlements({
        form,
        createMutation: createEntitlement,
        values: values.entitlements,
      })
      if (!createdEntitlementIds) return

      const attachEntitlementIds = createdEntitlementIds.filter(
        (id) => !licenseEntitlements.some((e) => e.id === id),
      )
      const detachEntitlementIds = licenseEntitlements
        .filter((e) => !createdEntitlementIds.includes(e.id))
        .map((e) => e.id)

      if (detachEntitlementIds.length > 0)
        await detachEntitlements.mutateAsync({
          licenseId: license.id,
          entitlementIds: detachEntitlementIds,
        })
      if (attachEntitlementIds.length > 0)
        await attachEntitlements.mutateAsync({
          licenseId: license.id,
          entitlementIds: attachEntitlementIds,
        })

      const attachUserIds = (values.users?.attach ?? []).filter(
        (id) => !licenseUsers.some((u) => u.id === id),
      )
      const detachUserIds = licenseUsers
        .filter((u) => !(values.users?.attach ?? []).includes(u.id))
        .map((u) => u.id)

      if (detachUserIds.length > 0)
        await detachUsers.mutateAsync({
          licenseId: license.id,
          userIds: detachUserIds,
        })
      if (attachUserIds.length > 0)
        await attachUsers.mutateAsync({
          licenseId: license.id,
          userIds: attachUserIds,
        })

      await updateLicense.mutateAsync(values)
      toast({ message: "License updated", variant: "success" })
      onOpenChange(false)
    },
    [
      form,
      license,
      onOpenChange,
      updateLicense,
      licenseEntitlements,
      attachEntitlements,
      detachEntitlements,
      createEntitlement,
      licenseUsers,
      attachUsers,
      detachUsers,
    ],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        fullscreen
      >
        <Forms.Layout.Sheet
          title="Editing an existing license"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          errorMessage="Failed to update license"
          isPending={
            updateLicense.isPending ||
            attachEntitlements.isPending ||
            detachEntitlements.isPending ||
            createEntitlement.isPending ||
            attachUsers.isPending ||
            detachUsers.isPending
          }
          submitLabel="Update"
          fullscreen
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

          <Separator className="my-8" />

          <Forms.Section.Columns title="Relationships">
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={["entitlements.attach", "entitlements.create"]}
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Licenses.Form.Fields schema="edit" include={["users.attach"]} />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
