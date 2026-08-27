import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"

import { useCreateLicense } from "@/queries/licenses"

import * as fathom from "@/fathom"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Licenses from "@/components/licenses"
import { Notice } from "@/components/notice"
import DocumentationLink from "@/components/documentation-link"

interface LicenseOnboardingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LicenseOnboardingForm({
  open,
  onOpenChange,
}: LicenseOnboardingFormProps) {
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
      policyId: "",
    },
  })

  const createLicense = useCreateLicense()

  const handleSubmit = useCallback(
    async (values: Schemas.Licenses.CreateValues) => {
      await createLicense.mutateAsync(values)
      toast({ message: "License created", variant: "success" })
      fathom.track("onboarding: license completed")
    },
    [createLicense],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createLicense.isPending}
          description="Creating a new license"
          errorMessage="Failed to create license"
          submitLabel="Create license"
          className="md:h-[54vh]!"
        >
          <Forms.Section.Step
            crumb="License attributes"
            fields={["policyId", "name", "key"]}
          >
            <div className="flex flex-col">
              <Notice className="m-4 mb-2 max-w-3xl">
                <Notice.Title>
                  Licenses grant access to your product
                </Notice.Title>
                <Notice.Description>
                  Each license resource will implement a policy, which will
                  define the "rules" which that license must follow to remain
                  valid.
                </Notice.Description>
              </Notice>

              <Forms.Field.Title>
                <Licenses.Form.Fields
                  schema="create"
                  include={["name"]}
                  titleVariant
                  autoFocus="name"
                />
              </Forms.Field.Title>

              <Forms.Section.Card title="License attributes">
                <Forms.Section.Columns>
                  <Forms.Section.Column>
                    <Licenses.Form.Fields
                      schema="create"
                      include={["policyId"]}
                      fieldVariant="stacking"
                    />
                    <Notice className="max-w-3xl">
                      <Notice.Description>
                        This should be the policy you created in the previous
                        step.
                      </Notice.Description>
                    </Notice>
                  </Forms.Section.Column>
                  <Forms.Section.Column>
                    <Licenses.Form.Fields
                      schema="create"
                      include={["key"]}
                      fieldVariant="stacking"
                    />
                    <Notice className="max-w-3xl">
                      <Notice.Description>
                        When creating a new license, you have the option to
                        manually specify a license key.
                      </Notice.Description>
                    </Notice>
                  </Forms.Section.Column>
                </Forms.Section.Columns>
              </Forms.Section.Card>

              <DocumentationLink page="licenses" />
            </div>
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
