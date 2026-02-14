import { useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import * as Schemas from "@/schemas"
import { IsolationStrategy } from "@/types/environments"

import { useCreateEnvironment } from "@/queries/environments"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Environments from "@/components/environments"
import DocumentationLink from "@/components/documentation-link"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"
import { Globe, GlobeLock } from "lucide-react"

interface CreateEnvironmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateEnvironmentForm({
  open,
  onOpenChange,
}: CreateEnvironmentFormProps) {
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

  const selectedStrategy = useWatch({
    control: form.control,
    name: "isolationStrategy",
  })

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit((values) => {
      createEnvironment.mutate(values, {
        onSuccess: () => {
          toast({ message: "Environment created", variant: "success" })
          onOpenChange(false)
        },
        onError: (error) => {
          toast({
            message: "Failed to create environment",
            description: error.detail,
            variant: "error",
          })
        },
      })
    })()
  }, [form, createEnvironment, onOpenChange])

  return (
    <Forms.Container.Dialog
      open={open}
      onOpenChange={onOpenChange}
      disableOverlay
    >
      <Form {...form}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
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
        >
          <Forms.Section.Step
            crumb="Isolation strategy"
            fields={["isolationStrategy"]}
          >
            <Forms.Field.CardSelector title="Isolation strategy">
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
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Environment attributes"
            fields={["name", "code"]}
          >
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
      </Form>
    </Forms.Container.Dialog>
  )
}
