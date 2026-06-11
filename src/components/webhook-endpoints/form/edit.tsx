import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import {
  useGetWebhookEndpoint,
  useUpdateWebhookEndpoint,
} from "@/queries/webhook-endpoints"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as WebhookEndpoints from "@/components/webhook-endpoints"

interface EditWebhookEndpointFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditWebhookEndpointForm({
  open,
  onOpenChange,
}: EditWebhookEndpointFormProps) {
  const { id } = useParams({ from: "/$accountId/app/webhook-endpoints/$id" })
  const { data: webhookEndpoint } = useGetWebhookEndpoint(id)

  const updateWebhookEndpoint = useUpdateWebhookEndpoint(
    webhookEndpoint?.id ?? "",
  )

  const form = useForm<
    Schemas.WebhookEndpoints.UpdateFormValues,
    unknown,
    Schemas.WebhookEndpoints.UpdateValues
  >({
    resolver: zodResolver(Schemas.WebhookEndpoints.UpdateSchema),
    mode: "onChange",
    values: webhookEndpoint
      ? Schemas.WebhookEndpoints.getFormValuesFromWebhookEndpoint(
          webhookEndpoint,
        )
      : undefined,
  })

  const handleSubmit = useCallback(
    async (values: Schemas.WebhookEndpoints.UpdateValues) => {
      await updateWebhookEndpoint.mutateAsync(values)
      toast({ message: "Webhook endpoint updated", variant: "success" })
    },
    [updateWebhookEndpoint],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing webhook endpoint"
          onSubmit={handleSubmit}
          errorMessage="Failed to update webhook endpoint"
          isPending={updateWebhookEndpoint.isPending}
          submitLabel="Update"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <WebhookEndpoints.Form.Fields
                schema="edit"
                include={["url", "apiVersion"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <WebhookEndpoints.Form.Fields
                schema="edit"
                include={["signatureAlgorithm", "product"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <WebhookEndpoints.Form.Fields
            schema="edit"
            include={["subscriptions"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
