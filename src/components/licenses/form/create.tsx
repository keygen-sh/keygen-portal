import { useCallback, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import {
  useCreateLicense,
  useAttachLicenseUsers,
  useAttachLicenseEntitlements,
} from "@/queries/licenses"
import { useListPolicies } from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"
import { settleCreateEntitlements } from "@/lib/entitlements"

import * as Forms from "@/components/forms"
import * as Licenses from "@/components/licenses"
import DocumentationLink from "@/components/documentation-link"

interface CreateLicenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateLicenseForm({
  open,
  onOpenChange,
}: CreateLicenseFormProps) {
  const form = useForm<Schemas.Licenses.CreateValues>({
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
      maxUses: null,
      metadata: {},
      entitlements: { attach: [], create: [] },
      users: { attach: [] },
    },
  })
  const createLicense = useCreateLicense()
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

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.CreateValues) => {
      const createdEntitlementIds = await settleCreateEntitlements({
        form,
        createMutation: createEntitlement,
        values: values.entitlements,
      })
      if (!createdEntitlementIds) return

      const license = await createLicense.mutateAsync({
        ...values,
        entitlements: { attach: [], create: [] },
        users: { attach: [] },
      })

      if (createdEntitlementIds.length > 0)
        await attachEntitlements.mutateAsync({
          licenseId: license.id,
          entitlementIds: createdEntitlementIds,
        })

      const userIds = values.users?.attach ?? []
      if (userIds.length > 0)
        await attachUsers.mutateAsync({ licenseId: license.id, userIds })

      toast({ message: "License created", variant: "success" })
      await navigateToResource(license)
    },
    [
      form,
      createLicense,
      createEntitlement,
      attachEntitlements,
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
            createEntitlement.isPending ||
            attachEntitlements.isPending ||
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
              "maxUses",
            ]}
          >
            <Forms.Section.Card title="License limits">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={["maxMachines", "maxProcesses", "maxUsers"]}
                    fieldVariant="stacking"
                    selectedPolicy={selectedPolicy}
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Licenses.Form.Fields
                    schema="create"
                    include={["maxCores", "maxUses"]}
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
              "users.attach",
            ]}
          >
            <Forms.Section.Card title="Relationships configuration">
              <Licenses.Form.Fields
                schema="create"
                include={["entitlements.attach", "entitlements.create"]}
              />

              <Licenses.Form.Fields
                schema="create"
                include={["users.attach"]}
              />
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
