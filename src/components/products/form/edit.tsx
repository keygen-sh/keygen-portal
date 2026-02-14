import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { DistributionStrategy } from "@/types/products"

import { useGetProduct, useUpdateProduct } from "@/queries/products"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Products from "@/components/products"

interface EditProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditProductForm({
  open,
  onOpenChange,
}: EditProductFormProps) {
  const { id } = useParams({ from: "/$accountId/app/products/$id" })
  const { data: product } = useGetProduct(id)

  const updateProduct = useUpdateProduct(product?.id ?? "")

  const form = useForm<Schemas.Products.UpdateValues>({
    resolver: zodResolver(Schemas.Products.UpdateSchema),
    mode: "onChange",
    values: {
      name: product?.attributes.name,
      code: product?.attributes.code,
      url: product?.attributes.url ?? "",
      distributionStrategy:
        product?.attributes.distributionStrategy ??
        DistributionStrategy.Licensed,
      platforms: product?.attributes.platforms ?? [],
      permissions: product?.attributes.permissions ?? [],
      metadata: product?.attributes.metadata ?? {},
    },
  })

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit((values) => {
      updateProduct.mutate(values, {
        onSuccess: () => {
          toast({ message: "Product updated", variant: "success" })
          onOpenChange(false)
        },
        onError: (error) => {
          toast({
            message: "Failed to update product",
            description: error.detail,
            variant: "error",
          })
        },
      })
    })()
  }, [form, updateProduct, onOpenChange])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing product"
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={updateProduct.isPending}
          submitLabel="Update"
          className="md:h-[70vh]!"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Products.Form.Fields
                schema="edit"
                include={["code", "name"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Products.Form.Fields
                schema="edit"
                include={["platforms", "url"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Products.Form.Fields
            schema="edit"
            include={["permissions"]}
            fieldVariant="stacking"
          />

          <Separator className="my-8" />

          <Products.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
