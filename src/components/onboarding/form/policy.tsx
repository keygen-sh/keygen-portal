import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"

import { useCreatePolicy } from "@/queries/policies"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Policies from "@/components/policies"
import { Button } from "@/components/ui/button"
import { Notice } from "@/components/notice"

const LICENSING_MODEL_URL = "https://keygen.sh/docs/choosing-a-licensing-model/"

interface PolicyOnboardingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PolicyOnboardingForm({
  open,
  onOpenChange,
}: PolicyOnboardingFormProps) {
  const form = useForm<
    Schemas.Policies.CreateFormValues,
    unknown,
    Schemas.Policies.CreateValues
  >({
    resolver: zodResolver(Schemas.Policies.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      duration: null,
      strict: false,
      product: { id: "" },
    },
  })

  const createPolicy = useCreatePolicy()

  const handleSubmit = useCallback(
    async (values: Schemas.Policies.CreateValues) => {
      await createPolicy.mutateAsync(values)
      toast({ message: "Policy created", variant: "success" })
    },
    [createPolicy],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createPolicy.isPending}
          description="Creating a new policy"
          errorMessage="Failed to create policy"
          submitLabel="Submit"
          className="md:h-[56vh]!"
        >
          <Forms.Section.Step
            crumb="Policy attributes"
            fields={["name", "product.id"]}
          >
            <div className="flex flex-col">
              <Notice className="m-4 mb-2 max-w-3xl">
                <Notice.Title>
                  Policies define behavior for different license types
                </Notice.Title>
                <Notice.Description>
                  Policies can be for a number of different things, from
                  different "tiers" for your product (e.g. Basic vs Pro) to
                  fine-grained feature policies. You can add more advanced
                  policies later, but for now, let's create a simple policy to
                  get started.
                </Notice.Description>
              </Notice>

              <Forms.Field.Title>
                <Policies.Form.Fields
                  schema="create"
                  include={["name"]}
                  titleVariant
                  autoFocus="name"
                />
              </Forms.Field.Title>

              <Forms.Section.Card title="Policy attributes">
                <Forms.Section.Columns>
                  <Forms.Section.Column>
                    <Policies.Form.Fields
                      schema="create"
                      include={["product"]}
                      fieldVariant="stacking"
                    />
                    <Notice className="max-w-3xl">
                      <Notice.Description>
                        This should be the product you created in the previous
                        step.
                      </Notice.Description>
                    </Notice>
                  </Forms.Section.Column>
                  <Forms.Section.Column>
                    <Policies.Form.Fields
                      schema="create"
                      include={["duration"]}
                      fieldVariant="stacking"
                    />
                    <Notice className="max-w-3xl">
                      <Notice.Description>
                        Licenses that implement this policy will be valid for
                        the duration you specify.
                      </Notice.Description>
                    </Notice>
                  </Forms.Section.Column>
                </Forms.Section.Columns>
              </Forms.Section.Card>

              <Notice className="mx-4 max-w-3xl">
                <Notice.Description>
                  Learn how to set up a policy that meets your licensing
                  requirements by reviewing our guide{" "}
                  <Button
                    asChild
                    size="link"
                    variant="link"
                    className="mt-0.25 h-4 text-xs"
                  >
                    <a
                      href={LICENSING_MODEL_URL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      on choosing a licensing model
                    </a>
                  </Button>
                  .
                </Notice.Description>
              </Notice>
            </div>
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
