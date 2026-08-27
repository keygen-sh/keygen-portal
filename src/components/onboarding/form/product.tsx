import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"
import { DistributionStrategy } from "@/types/products"

import { useCreateProduct } from "@/queries/products"

import * as fathom from "@/fathom"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Products from "@/components/products"
import { Notice } from "@/components/notice"
import DocumentationLink from "@/components/documentation-link"

interface ProductOnboardingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductOnboardingForm({
  open,
  onOpenChange,
}: ProductOnboardingFormProps) {
  const form = useForm<
    Schemas.Products.CreateFormValues,
    unknown,
    Schemas.Products.CreateValues
  >({
    resolver: zodResolver(Schemas.Products.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      url: "",
      platforms: [],
      permissions: null,
      metadata: [],
      distributionStrategy: DistributionStrategy.Licensed,
    },
  })

  const createProduct = useCreateProduct()

  const handleSubmit = useCallback(
    async (values: Schemas.Products.CreateValues) => {
      await createProduct.mutateAsync(values)
      toast({ message: "Product created", variant: "success" })
      fathom.track("onboarding: product completed")
    },
    [createProduct],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onSubmit={handleSubmit}
          isPending={createProduct.isPending}
          description="Creating a new product"
          errorMessage="Failed to create product"
          submitLabel="Create product"
        >
          <Forms.Section.Step
            crumb="Create a product"
            fields={["name", "code"]}
          >
            <div className="flex flex-col gap-4 p-6">
              <Notice className="max-w-3xl">
                <Notice.Title>
                  Products represent the items you sell, license, and
                  distribute.
                </Notice.Title>
                <Notice.Description>
                  The product resource is used to segment policies and licenses,
                  in the case where you sell multiple products. This allows you
                  to keep licenses and policies between multiple products
                  organized. If you don't sell more than 1 product, this will be
                  a one-time step.
                </Notice.Description>
              </Notice>

              <Products.Form.Fields
                schema="create"
                include={["name", "code"]}
                fieldVariant="stacking"
                autoFocus="name"
              />

              <DocumentationLink page="products" />
            </div>
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
