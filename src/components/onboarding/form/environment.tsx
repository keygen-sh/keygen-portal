import { useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Globe, GlobeLock } from "lucide-react"

import * as Schemas from "@/schemas"
import { IsolationStrategy } from "@/types/environments"

import { useEnvironment } from "@/hooks/use-environment"

import { useCreateEnvironment } from "@/queries/environments"

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
      isolationStrategy: IsolationStrategy.Isolated,
    },
  })

  const createEnvironment = useCreateEnvironment()
  const { select } = useEnvironment()

  const selectedStrategy = useWatch({
    control: form.control,
    name: "isolationStrategy",
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Environments.CreateValues) => {
      const environment = await createEnvironment.mutateAsync(values)

      toast({
        message: "Environment created",
        variant: "success",
      })

      try {
        await select(environment.id, environment.attributes.code)
      } catch (error) {
        console.error(error)
      }
    },
    [createEnvironment, select],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createEnvironment.isPending}
          description={
            <BadgeGroup prefix="Creating a new" suffix="environment">
              {selectedStrategy === IsolationStrategy.Isolated ? (
                <BadgeGroupItem>
                  <GlobeLock />
                  Isolated
                </BadgeGroupItem>
              ) : (
                <BadgeGroupItem>
                  <Globe />
                  Shared
                </BadgeGroupItem>
              )}
            </BadgeGroup>
          }
          errorMessage="Failed to create environment"
          submitLabel="Submit"
        >
          <Forms.Section.Step
            crumb="Isolation strategy"
            fields={["isolationStrategy"]}
          >
            <div className="flex flex-col gap-4 p-6">
              <Notice className="mb-2 max-w-3xl">
                <Notice.Title>
                  You can use environments to separate your production data from
                  your integration and testing data.
                </Notice.Title>
                <Notice.Description>
                  This is useful for testing new features or integrations
                  without affecting production. For this, you'd want to use an
                  isolated environment, which keeps its resources separate from
                  other environments and cannot affect outside resources.
                </Notice.Description>
              </Notice>

              <Forms.Field.CardSelector
                title="Isolation strategy"
                className="m-0 p-0"
              >
                <Environments.Form.Fields
                  schema="create"
                  include={["isolationStrategy"]}
                />
              </Forms.Field.CardSelector>

              <DocumentationLink
                page="environments"
                section="isolation-strategies"
                message="For more information on isolation strategies and their effects, see"
              >
                Notes on isolation.
              </DocumentationLink>
            </div>
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Environment attributes"
            fields={["name", "code"]}
          >
            <Notice className="m-4 mb-0 max-w-3xl">
              <Notice.Title>
                Add a name and code for your environment.
              </Notice.Title>
              <Notice.Description>
                This should be something that helps you identify the
                environment, such as "Dev", "Staging" or "Sandbox". The code is
                a unique identifier for the environment, and is typically used
                in API requests to specify which environment to use.
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
              <Environments.Form.Fields
                schema="create"
                include={["code"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="environments" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
