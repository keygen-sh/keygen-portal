import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Globe } from "lucide-react"

import * as Schemas from "@/schemas"
import { IsolationStrategy } from "@/types/environments"

import { useCreateEnvironment } from "@/queries/environments"

import * as fathom from "@/fathom"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Environments from "@/components/environments"
import { Notice } from "@/components/notice"
import DocumentationLink from "@/components/documentation-link"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

interface EnvironmentOnboardingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EnvironmentOnboardingForm({
  open,
  onOpenChange,
}: EnvironmentOnboardingFormProps) {
  const form = useForm<Schemas.Environments.CreateValues>({
    resolver: zodResolver(Schemas.Environments.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      isolationStrategy: IsolationStrategy.Shared,
    },
  })

  const createEnvironment = useCreateEnvironment()

  const handleSubmit = useCallback(
    async (values: Schemas.Environments.CreateValues) => {
      await createEnvironment.mutateAsync(values)

      toast({
        message: "Environment created",
        variant: "success",
      })
      fathom.track("onboarding: environment completed")
    },
    [createEnvironment],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createEnvironment.isPending}
          description={
            <BadgeGroup prefix="Creating a new" suffix="environment">
              <BadgeGroupItem>
                <Globe />
                Shared
              </BadgeGroupItem>
            </BadgeGroup>
          }
          errorMessage="Failed to create environment"
          submitLabel="Submit"
        >
          <Forms.Section.Step
            crumb="Environment attributes"
            fields={["name", "code"]}
          >
            <Notice className="m-4 mb-0 max-w-3xl">
              <Notice.Title>
                You can use environments to separate your production data from
                your integration and testing data.
              </Notice.Title>
              <Notice.Description>
                This is useful for testing new features or integrations without
                affecting production.
              </Notice.Description>
            </Notice>

            <Forms.Field.Title>
              <Environments.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Environment attributes">
              <>
                <Environments.Form.Fields
                  schema="create"
                  include={["code"]}
                  fieldVariant="stacking"
                />
                <Notice className="mt-4 w-fit">
                  <Notice.Description>
                    The code is a unique identifier for the environment, and is
                    typically used in API requests to specify which environment
                    to use.
                  </Notice.Description>
                </Notice>
              </>
            </Forms.Section.Card>

            <DocumentationLink
              page="environments"
              section="isolation-strategies"
              message="For more information on isolation strategies and their effects, see"
            >
              Notes on isolation.
            </DocumentationLink>
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
