import { useCallback, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import {
  useCreateLicense,
  useChangeLicenseGroup,
  useChangeLicenseOwner,
  useAttachLicenseUsers,
  useAttachLicenseEntitlements,
} from "@/queries/licenses"
import { useListPolicies, useListPolicyEntitlements } from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"
import { useCreateUser } from "@/queries/users"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { settleRelationships } from "@/lib/relationships"
import { settleCreateEntitlements } from "@/lib/entitlements"
import { settleCreateUsers } from "@/lib/users"

import * as keygen from "@/keygen"
import * as Forms from "@/components/forms"
import * as Licenses from "@/components/licenses"
import * as Permissions from "@/components/permissions"
import DocumentationLink from "@/components/documentation-link"

interface CreateLicenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateLicenseForm({
  open,
  onOpenChange,
}: CreateLicenseFormProps) {
  const form = useForm<
    Schemas.Licenses.CreateFormValues,
    unknown,
    Schemas.Licenses.CreateValues
  >({
    resolver: zodResolver(Schemas.Licenses.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      key: "",
      expiry: null,
      policyId: "",
      suspended: null,
      protected: null,
      maxMachines: null,
      maxProcesses: null,
      maxUsers: null,
      maxCores: null,
      maxMemory: null,
      maxDisk: null,
      maxUses: null,
      groupId: null,
      ownerId: null,
      permissions: null,
      metadata: [],
      entitlements: { attach: [], create: [] },
      users: { attach: [], create: [] },
    },
  })
  const createLicense = useCreateLicense()
  const changeGroup = useChangeLicenseGroup()
  const changeOwner = useChangeLicenseOwner()
  const createUser = useCreateUser()
  const attachUsers = useAttachLicenseUsers()
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachLicenseEntitlements()
  const navigateToResource = useResourceNavigate()

  const { data: policies = [] } = useListPolicies()
  const selectedPolicyId = useWatch({ control: form.control, name: "policyId" })
  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id === selectedPolicyId) ?? null,
    [policies, selectedPolicyId],
  )
  const { data: policyEntitlements = [] } = useListPolicyEntitlements(
    selectedPolicyId,
    { limit: 100 },
  )

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.CreateValues) => {
      const entitlementIds = await settleCreateEntitlements({
        form,
        createMutation: createEntitlement,
        values: values.entitlements,
      })
      if (!entitlementIds) {
        throw new Error("Failed to create entitlement(s)")
      }

      const settledUserIds = await settleCreateUsers({
        form,
        createMutation: createUser,
        values: values.users,
      })
      if (!settledUserIds) {
        throw new Error("Failed to create user(s)")
      }

      const license = await createLicense.mutateAsync({
        ...values,
        entitlements: { attach: [], create: [] },
        users: { attach: [], create: [] },
      })

      const { ownerId, groupId } = values
      const attachEntitlementIds = entitlementIds.filter(
        (id) => !policyEntitlements.some((e) => e.id === id),
      )
      const userIds = settledUserIds.filter((id) => id !== ownerId)

      await settleRelationships({
        message: "License created",
        steps: [
          ownerId && {
            failure: "the owner could not be assigned",
            run: () =>
              changeOwner.mutateAsync({ licenseId: license.id, ownerId }),
          },
          groupId && {
            failure: "the group could not be assigned",
            run: () =>
              changeGroup.mutateAsync({ licenseId: license.id, groupId }),
          },
          attachEntitlementIds.length > 0 && {
            failure: "entitlements could not be attached",
            run: () =>
              attachEntitlements.mutateAsync({
                licenseId: license.id,
                entitlementIds: attachEntitlementIds,
              }),
          },
          userIds.length > 0 && {
            failure: "users could not be attached",
            run: () =>
              attachUsers.mutateAsync({ licenseId: license.id, userIds }),
          },
        ],
      })

      await navigateToResource(license)
    },
    [
      form,
      policyEntitlements,
      createLicense,
      changeGroup,
      changeOwner,
      createEntitlement,
      attachEntitlements,
      createUser,
      attachUsers,
      navigateToResource,
    ],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={
            createLicense.isPending ||
            changeGroup.isPending ||
            changeOwner.isPending ||
            createEntitlement.isPending ||
            attachEntitlements.isPending ||
            createUser.isPending ||
            attachUsers.isPending
          }
          description="Creating a new license"
          errorMessage="Failed to create license"
        >
          <Forms.Section.Step
            crumb="General attributes"
            fields={["name", "key", "policyId"]}
          >
            <Forms.Field.Title>
              <Licenses.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="General attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={["key"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={["policyId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="licenses" />
          </Forms.Section.Step>

          <Forms.Section.Step crumb="License expiration" fields={["expiry"]}>
            <Forms.Section.Card title="License expiration">
              <Licenses.Form.Fields
                schema="create"
                include={["expiry"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="licenses" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="License limits"
            fields={[
              "maxMachines",
              "maxProcesses",
              "maxUsers",
              "maxCores",
              "maxMemory",
              "maxDisk",
              "maxUses",
            ]}
          >
            <Forms.Section.Card title="License limits">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={[
                      "maxUsers",
                      "maxMachines",
                      "maxProcesses",
                      "maxCores",
                    ]}
                    fieldVariant="stacking"
                    selectedPolicy={selectedPolicy}
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={["maxUses", "maxMemory", "maxDisk"]}
                    fieldVariant="stacking"
                    selectedPolicy={selectedPolicy}
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
              <p className="mb-2 text-sm text-content-muted">
                Leave empty to inherit limits from the policy. Set a value to
                override the policy's limits for this specific license.
              </p>
            </Forms.Section.Card>

            <DocumentationLink page="licenses" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Relationships"
            fields={[
              "entitlements.attach",
              "entitlements.create",
              "groupId",
              "ownerId",
              "users.attach",
              "users.create",
            ]}
          >
            <Forms.Section.Card title="Relationships configuration">
              <Licenses.Form.Fields
                schema="create"
                include={["entitlements.attach", "entitlements.create"]}
              />

              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    fieldVariant="stacking"
                    include={["groupId"]}
                  />
                </Forms.Section.Column>

                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    fieldVariant="stacking"
                    include={["ownerId"]}
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <Licenses.Form.Fields
                schema="create"
                fieldVariant="stacking"
                include={["users.attach", "users.create"]}
              />
            </Forms.Section.Card>

            <DocumentationLink page="licenses" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="License permissions"
            fields={["permissions"]}
          >
            <Forms.Section.Card title="License permissions">
              {keygen.config.isCE ? (
                <Permissions.Upgrade />
              ) : (
                <Licenses.Form.Fields
                  schema="create"
                  include={["permissions"]}
                  fieldVariant="stacking"
                />
              )}
            </Forms.Section.Card>

            <DocumentationLink page="licenses" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Additional configuration"
            fields={["protected", "suspended", "metadata"]}
          >
            <Forms.Section.Card title="Additional configuration">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={["protected"]}
                    selectedPolicy={selectedPolicy}
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={["suspended"]}
                    selectedPolicy={selectedPolicy}
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <Licenses.Form.Fields
                schema="create"
                include={["metadata"]}
                selectedPolicy={selectedPolicy}
              />
            </Forms.Section.Card>

            <DocumentationLink page="licenses" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
