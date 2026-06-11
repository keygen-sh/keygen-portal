import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { useGetEndpoint, useUpdateEndpoint } from "@/queries/endpoints"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Endpoints from "@/components/endpoints"

interface EditEndpointFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditEndpointForm({
  open,
  onOpenChange,
}: EditEndpointFormProps) {
  const { id } = useParams({ from: "/$accountId/app/webhook-endpoints/$id" })
  const { data: endpoint } = useGetEndpoint(id)

  const updateEndpoint = useUpdateEndpoint(endpoint?.id ?? "")

  const form = useForm<
    Schemas.Endpoints.UpdateFormValues,
    unknown,
    Schemas.Endpoints.UpdateValues
  >({
    resolver: zodResolver(Schemas.Endpoints.UpdateSchema),
    mode: "onChange",
    values: endpoint
      ? Schemas.Endpoints.getFormValuesFromEndpoint(endpoint)
      : undefined,
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Endpoints.UpdateValues) => {
      await updateEndpoint.mutateAsync(values)
      toast({ message: "Endpoint updated", variant: "success" })
    },
    [updateEndpoint],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing webhook endpoint"
          onSubmit={handleSubmit}
          errorMessage="Failed to update webhook endpoint"
          isPending={updateEndpoint.isPending}
          submitLabel="Update"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Endpoints.Form.Fields
                schema="edit"
                include={["url", "apiVersion"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Endpoints.Form.Fields
                schema="edit"
                include={["signatureAlgorithm", "product"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Endpoints.Form.Fields
            schema="edit"
            include={["subscriptions"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
