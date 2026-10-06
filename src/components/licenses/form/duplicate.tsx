import { useCallback, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import {
  useGetLicense,
  useCreateLicense,
  useChangeLicenseGroup,
  useChangeLicenseOwner,
  useListLicenseUsers,
  useAttachLicenseUsers,
  useListLicenseEntitlements,
  useAttachLicenseEntitlements,
} from "@/queries/licenses"
import { useGetPolicy, useListPolicyEntitlements } from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"
import { useAccountDefaultLicensePermissions } from "@/hooks/use-account-default-license-permissions"

import { LicenseMode } from "@/types/licenses"

import { settleRelationships } from "@/lib/relationships"
import { settleCreateEntitlements } from "@/lib/entitlements"

import * as keygen from "@/keygen"
import * as Forms from "@/components/forms"
import * as Licenses from "@/components/licenses"
import * as Permissions from "@/components/permissions"

interface DuplicateLicenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DuplicateLicenseForm({
  open,
  onOpenChange,
}: DuplicateLicenseFormProps) {
  const { id } = useParams({ from: "/$accountId/app/licenses/$id" })
  const { data: license } = useGetLicense(id)
  const { data: licenseEntitlements = [] } = useListLicenseEntitlements(
    license?.id ?? "",
    { limit: 100 },
  )
  const { data: licenseUsers = [] } = useListLicenseUsers(license?.id ?? "")
  const sourcePolicyId = license?.relationships.policy?.data?.id ?? null
  const { data: sourcePolicyEntitlements = [] } = useListPolicyEntitlements(
    sourcePolicyId ?? "",
    { limit: 100 },
  )
  const defaultPermissions = useAccountDefaultLicensePermissions()

  const createLicense = useCreateLicense()
  const changeGroup = useChangeLicenseGroup()
  const changeOwner = useChangeLicenseOwner()
  const attachUsers = useAttachLicenseUsers()
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachLicenseEntitlements()
  const navigateToResource = useResourceNavigate()
  const mode = LicenseMode.Duplicate

  const defaultValues = useMemo(() => {
    if (!license) return undefined
    const values =
      Schemas.Licenses.getFormValuesFromLicense<Schemas.Licenses.CreateFormValues>(
        license,
      )
    const { permissions } = values
    const matchesDefaultPermissions =
      permissions != null &&
      permissions.length === defaultPermissions.length &&
      defaultPermissions.every((p) => permissions.includes(p))

    return {
      ...values,
      name: values.name ? `${values.name} (dup)` : "",
      key: "",
      permissions: matchesDefaultPermissions ? null : permissions,
      entitlements: {
        attach: licenseEntitlements
          .filter((e) => !sourcePolicyEntitlements.some((p) => p.id === e.id))
          .map((e) => e.id),
        create: [],
      },
      users: {
        attach: licenseUsers
          .filter((user) => user.id !== values.ownerId)
          .map((user) => user.id),
      },
    }
  }, [
    license,
    licenseEntitlements,
    licenseUsers,
    sourcePolicyEntitlements,
    defaultPermissions,
  ])

  const form = useForm<
    Schemas.Licenses.CreateFormValues,
    unknown,
    Schemas.Licenses.CreateValues
  >({
    resolver: zodResolver(Schemas.Licenses.CreateSchema),
    mode: "onChange",
    values: defaultValues,
  })

  const selectedPolicyId = useWatch({ control: form.control, name: "policyId" })
  const { data: policy } = useGetPolicy(selectedPolicyId ?? "")
  const { data: selectedPolicyEntitlements = [] } = useListPolicyEntitlements(
    selectedPolicyId ?? "",
    { limit: 100 },
  )

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.CreateValues) => {
      const entitlementIds = await settleCreateEntitlements({
        form,
        createMutation: createEntitlement,
        values: values.entitlements,
      })
      if (!entitlementIds) return

      const created = await createLicense.mutateAsync({
        ...values,
        entitlements: { attach: [], create: [] },
        users: { attach: [] },
      })

      const { ownerId, groupId } = values
      const attachEntitlementIds = entitlementIds.filter(
        (id) => !selectedPolicyEntitlements.some((e) => e.id === id),
      )
      const userIds = (values.users?.attach ?? []).filter(
        (id) => id !== ownerId,
      )

      await settleRelationships({
        message: "License created",
        steps: [
          ownerId && {
            failure: "the owner could not be assigned",
            run: () =>
              changeOwner.mutateAsync({ licenseId: created.id, ownerId }),
          },
          groupId && {
            failure: "the group could not be assigned",
            run: () =>
              changeGroup.mutateAsync({ licenseId: created.id, groupId }),
          },
          attachEntitlementIds.length > 0 && {
            failure: "entitlements could not be attached",
            run: () =>
              attachEntitlements.mutateAsync({
                licenseId: created.id,
                entitlementIds: attachEntitlementIds,
              }),
          },
          userIds.length > 0 && {
            failure: "users could not be attached",
            run: () =>
              attachUsers.mutateAsync({ licenseId: created.id, userIds }),
          },
        ],
      })

      await navigateToResource(created)
    },
    [
      form,
      selectedPolicyEntitlements,
      createLicense,
      changeGroup,
      changeOwner,
      createEntitlement,
      attachEntitlements,
      attachUsers,
      navigateToResource,
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
          title="Duplicating an existing license"
          onSubmit={handleSubmit}
          errorMessage="Failed to create license"
          isPending={
            createLicense.isPending ||
            changeGroup.isPending ||
            changeOwner.isPending ||
            createEntitlement.isPending ||
            attachEntitlements.isPending ||
            attachUsers.isPending
          }
          submitLabel="Create"
          size="fullscreen"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="create"
                mode={mode}
                include={[
                  "expiry",
                  "key",
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
                schema="create"
                mode={mode}
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
            <Forms.Section.Column>
              {keygen.config.isCE ? (
                <Permissions.Upgrade />
              ) : (
                <Licenses.Form.Fields
                  schema="create"
                  mode={mode}
                  include={["permissions"]}
                  fieldVariant="stacking"
                />
              )}
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="create"
                mode={mode}
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Forms.Section.Columns title="Relationships">
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="create"
                mode={mode}
                fieldVariant="stacking"
                include={["policyId"]}
              />
              <Licenses.Form.Fields
                schema="create"
                mode={mode}
                include={["entitlements.attach", "entitlements.create"]}
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Licenses.Form.Fields
                schema="create"
                mode={mode}
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
