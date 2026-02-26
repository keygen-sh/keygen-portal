import { useCallback, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { useCreateLicense } from "@/queries/licenses"
import { useListPolicies } from "@/queries/policies"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

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
    },
  })
  const createLicense = useCreateLicense()
  const navigateToResource = useResourceNavigate()

  const { data: policies = [] } = useListPolicies()
  const selectedPolicyId = useWatch({ control: form.control, name: "policyId" })
  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id === selectedPolicyId) ?? null,
    [policies, selectedPolicyId],
  )

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.CreateValues) => {
      const license = await createLicense.mutateAsync(values)
      toast({ message: "License created", variant: "success" })
      onOpenChange(false)
      await navigateToResource(license)
    },
    [createLicense, navigateToResource, onOpenChange],
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
