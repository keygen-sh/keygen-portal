import { useCallback, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { useCreateLicense } from "@/queries/licenses"
import { useListPolicies } from "@/queries/policies"
import { settleMutations } from "@/queries/utils"
import { useCreateEntitlement } from "@/queries/entitlements"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import { toast } from "@/lib/toast"

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
    },
  })
  const createLicense = useCreateLicense()
  const createEntitlement = useCreateEntitlement()
  const navigateToResource = useResourceNavigate()

  const { data: policies = [] } = useListPolicies()
  const selectedPolicyId = useWatch({ control: form.control, name: "policyId" })
  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id === selectedPolicyId) ?? null,
    [policies, selectedPolicyId],
  )

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.CreateValues) => {
      const attachIds = values.entitlements?.attach ?? []
      const toCreate = values.entitlements?.create ?? []

      const [entitlements, errors] = await settleMutations<Entitlement>(
        toCreate.map((attrs) => createEntitlement.mutateAsync(attrs)),
      )
      const entitlementIds = Array.from(
        new Set([...attachIds, ...entitlements.map((e) => e.id)]),
      )

      const nextAttach = [...entitlementIds]
      const nextCreate = errors.map(({ index }) => toCreate[index])

      form.setValue("entitlements.attach", nextAttach)
      form.setValue("entitlements.create", nextCreate)

      if (errors.length > 0) {
        const fieldErrors = errors.map((error, index) => {
          let message = ""
          if (error.reason.code === EntitlementErrorCode.CodeTaken) {
            message = "Code already exists"
          } else {
            message = "Field is invalid"
          }

          return {
            path: `entitlements.create.${index}.code` as const,
            message,
          }
        })

        toast({
          message: "Failed to create entitlement(s)",
          variant: "error",
        })

        fieldErrors.forEach((fieldError) => {
          form.setError(fieldError.path, {
            type: "validate",
            message: fieldError.message,
          })
        })

        return
      }

      const license = await createLicense.mutateAsync({
        ...values,
        entitlements: { attach: entitlementIds, create: [] },
      })
      toast({ message: "License created", variant: "success" })
      onOpenChange(false)
      await navigateToResource(license)
    },
    [form, createLicense, createEntitlement, navigateToResource, onOpenChange],
  )

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createLicense.isPending}
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
            crumb="Entitlements"
            fields={["entitlements.attach", "entitlements.create"]}
          >
            <Forms.Section.Card title="Entitlements">
              <Licenses.Form.Fields
                schema="create"
                include={["entitlements.attach", "entitlements.create"]}
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
      </Form>
    </Forms.Container.Dialog>
  )
}
