import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import { useCreateWebhookEndpoint } from "@/queries/webhook-endpoints"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as WebhookEndpoints from "@/components/webhook-endpoints"

interface CreateWebhookEndpointFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateWebhookEndpointForm({
  open,
  onOpenChange,
}: CreateWebhookEndpointFormProps) {
  const form = useForm<
    Schemas.WebhookEndpoints.CreateFormValues,
    unknown,
    Schemas.WebhookEndpoints.CreateValues
  >({
    resolver: zodResolver(Schemas.WebhookEndpoints.CreateSchema),
    mode: "onChange",
    defaultValues: Schemas.WebhookEndpoints.CreateDefaults,
  })
  const createWebhookEndpoint = useCreateWebhookEndpoint()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.WebhookEndpoints.CreateValues) => {
      const webhookEndpoint = await createWebhookEndpoint.mutateAsync(values)
      toast({ message: "Endpoint created", variant: "success" })
      await navigateToResource(webhookEndpoint)
    },
    [createWebhookEndpoint, navigateToResource],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createWebhookEndpoint.isPending}
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
              <WebhookEndpoints.Form.Fields
                schema="create"
                include={["url"]}
                titleVariant
                autoFocus="url"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Endpoint attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <WebhookEndpoints.Form.Fields
                    schema="create"
                    include={["signatureAlgorithm", "product"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <WebhookEndpoints.Form.Fields
                    schema="create"
                    include={["apiVersion"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <WebhookEndpoints.Form.Fields
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
