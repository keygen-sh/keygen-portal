import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import { useCreateEndpoint } from "@/queries/endpoints"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Endpoints from "@/components/endpoints"

interface CreateEndpointFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateEndpointForm({
  open,
  onOpenChange,
}: CreateEndpointFormProps) {
  const form = useForm<
    Schemas.Endpoints.CreateFormValues,
    unknown,
    Schemas.Endpoints.CreateValues
  >({
    resolver: zodResolver(Schemas.Endpoints.CreateSchema),
    mode: "onChange",
    defaultValues: Schemas.Endpoints.CreateDefaults,
  })
  const createEndpoint = useCreateEndpoint()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Endpoints.CreateValues) => {
      const endpoint = await createEndpoint.mutateAsync(values)
      toast({ message: "Endpoint created", variant: "success" })
      await navigateToResource(endpoint)
    },
    [createEndpoint, navigateToResource],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createEndpoint.isPending}
          description="Creating a new webhook endpoint"
          errorMessage="Failed to create webhook endpoint"
        >
          <Forms.Section.Step
            crumb="Endpoint attributes"
            fields={[
              "url",
              "subscriptions",
              "signatureAlgorithm",
              "apiVersion",
              "product.id",
            ]}
          >
            <Forms.Field.Title>
              <Endpoints.Form.Fields
                schema="create"
                include={["url"]}
                titleVariant
                autoFocus="url"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Endpoint attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Endpoints.Form.Fields
                    schema="create"
                    include={["signatureAlgorithm", "product"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Endpoints.Form.Fields
                    schema="create"
                    include={["apiVersion"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <Endpoints.Form.Fields
                schema="create"
                include={["subscriptions"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
