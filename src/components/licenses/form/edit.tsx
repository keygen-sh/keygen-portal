import { useCallback, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { recordToMetadataPairs } from "@/schemas/metadata"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import {
  useGetLicense,
  useUpdateLicense,
  useChangeLicensePolicy,
  useChangeLicenseGroup,
  useChangeLicenseOwner,
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

import * as keygen from "@/keygen"
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
  const { data: licenseEntitlements = [] } = useListLicenseEntitlements(
    license?.id ?? "",
  )
  const { data: licenseUsers = [] } = useListLicenseUsers(license?.id ?? "")
  const currentPolicyId = license?.relationships.policy?.data?.id ?? null
  const currentGroupId = license?.relationships.group?.data?.id ?? null
  const currentOwnerId = license?.relationships.owner?.data?.id ?? null
  const attachedLicenseUsers = useMemo(
    () => licenseUsers.filter((user) => user.id !== currentOwnerId),
    [licenseUsers, currentOwnerId],
  )

  const updateLicense = useUpdateLicense(license?.id ?? "")
  const changePolicy = useChangeLicensePolicy()
  const changeGroup = useChangeLicenseGroup()
  const changeOwner = useChangeLicenseOwner()
  const attachUsers = useAttachLicenseUsers()
  const detachUsers = useDetachLicenseUsers()
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachLicenseEntitlements()
  const detachEntitlements = useDetachLicenseEntitlements()

  const form = useForm<
    Schemas.Licenses.UpdateFormValues,
    unknown,
    Schemas.Licenses.UpdateValues
  >({
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
          maxMemory: license.attributes.maxMemory ?? null,
          maxDisk: license.attributes.maxDisk ?? null,
          maxUses: license.attributes.maxUses ?? null,
          policyId: currentPolicyId ?? "",
          groupId: currentGroupId,
          ownerId: currentOwnerId,
          permissions: license.attributes.permissions ?? null,
          metadata: recordToMetadataPairs(license.attributes.metadata),
          entitlements: {
            attach: licenseEntitlements.map((e) => e.id),
            create: [],
          },
          users: {
            attach: attachedLicenseUsers.map((u) => u.id),
          },
        }
      : undefined,
  })

  const selectedPolicyId = useWatch({ control: form.control, name: "policyId" })
  const { data: policy } = useGetPolicy(selectedPolicyId ?? "")

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

      const newOwnerId = values.ownerId ?? null
      const selectedUserIds = (values.users?.attach ?? []).filter(
        (id) => id !== newOwnerId,
      )

      const attachUserIds = selectedUserIds.filter(
        (id) => !attachedLicenseUsers.some((u) => u.id === id),
      )
      const detachUserIds = attachedLicenseUsers
        .filter((u) => !selectedUserIds.includes(u.id))
        .map((u) => u.id)

      if (detachUserIds.length > 0)
        await detachUsers.mutateAsync({
          licenseId: license.id,
          userIds: detachUserIds,
        })

      if (newOwnerId !== currentOwnerId) {
        await changeOwner.mutateAsync({
          licenseId: license.id,
          ownerId: newOwnerId,
        })
      }

      if (attachUserIds.length > 0)
        await attachUsers.mutateAsync({
          licenseId: license.id,
          userIds: attachUserIds,
        })

      const newGroupId = values.groupId ?? null
      if (newGroupId !== currentGroupId) {
        await changeGroup.mutateAsync({
          licenseId: license.id,
          groupId: newGroupId,
        })
      }

      await updateLicense.mutateAsync(values)

      const newPolicyId = values.policyId
      if (newPolicyId && newPolicyId !== currentPolicyId) {
        await changePolicy.mutateAsync({
          licenseId: license.id,
          policyId: newPolicyId,
        })
      }

      toast({ message: "License updated", variant: "success" })
    },
    [
      form,
      license,
      updateLicense,
      licenseEntitlements,
      attachEntitlements,
      detachEntitlements,
      createEntitlement,
      currentPolicyId,
      currentGroupId,
      currentOwnerId,
      attachedLicenseUsers,
      changePolicy,
      changeGroup,
      changeOwner,
      attachUsers,
      detachUsers,
    ],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="fullscreen"
      >
        <Forms.Layout.Sheet
          title="Editing an existing license"
          onSubmit={handleSubmit}
          errorMessage="Failed to update license"
          isPending={
            updateLicense.isPending ||
            changePolicy.isPending ||
            changeGroup.isPending ||
            changeOwner.isPending ||
            attachEntitlements.isPending ||
            detachEntitlements.isPending ||
            createEntitlement.isPending ||
            attachUsers.isPending ||
            detachUsers.isPending
          }
          submitLabel="Update"
          size="fullscreen"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={[
                  "expiry",
                  "maxCores",
                  "maxMemory",
                  "maxDisk",
                  "maxProcesses",
                ]}
                fieldVariant="stacking"
                selectedPolicy={policy}
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={[
                  "maxUsers",
                  "maxMachines",
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
            {!keygen.config.isCE && (
              <Forms.Section.Column>
                <Licenses.Form.Fields
                  schema="edit"
                  include={["permissions"]}
                  fieldVariant="stacking"
                />
              </Forms.Section.Column>
            )}
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Forms.Section.Columns title="Relationships">
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                fieldVariant="stacking"
                include={["policyId"]}
              />
              <Licenses.Form.Fields
                schema="edit"
                include={["entitlements.attach", "entitlements.create"]}
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="edit"
                fieldVariant="stacking"
                include={["groupId", "ownerId", "users.attach"]}
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
