import { useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"

import { Award, Lock, Unlock } from "lucide-react"

import * as Schemas from "@/schemas"
import { DistributionStrategy } from "@/types/products"

import { useCreateProduct } from "@/queries/products"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Products from "@/components/products"
import DocumentationLink from "@/components/documentation-link"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

interface CreateProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateProductForm({
  open,
  onOpenChange,
}: CreateProductFormProps) {
  const form = useForm<Schemas.Products.CreateValues>({
    resolver: zodResolver(Schemas.Products.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      url: "",
      platforms: [],
      permissions: [],
      metadata: {},
      distributionStrategy: DistributionStrategy.Licensed,
    },
  })

  const createProduct = useCreateProduct()
  const navigateToResource = useResourceNavigate()

  const selectedStrategy = useWatch({
    control: form.control,
    name: "distributionStrategy",
  })

  const handleSubmit = useCallback(async () => {
    await form.handleSubmit((values) => {
      createProduct.mutate(values, {
        onSuccess: async (product) => {
          toast({ message: "Product created", variant: "success" })
          onOpenChange(false)
          await navigateToResource(product)
        },
        onError: (error) => {
          toast({
            message: "Failed to create product",
            description: error.detail,
            variant: "error",
          })
        },
      })
    })()
  }, [form, createProduct, navigateToResource, onOpenChange])

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createProduct.isPending}
          description={
            <BadgeGroup prefix="Creating a new" suffix="product">
              {selectedStrategy === DistributionStrategy.Licensed && (
                <BadgeGroupItem>
                  <Award />
                  Licensed
                </BadgeGroupItem>
              )}
              {selectedStrategy === DistributionStrategy.Open && (
                <BadgeGroupItem>
                  <Unlock />
                  Open
                </BadgeGroupItem>
              )}
              {selectedStrategy === DistributionStrategy.Closed && (
                <BadgeGroupItem>
                  <Lock />
                  Closed
                </BadgeGroupItem>
              )}
            </BadgeGroup>
          }
          className="md:h-[52vh]!"
        >
          <Forms.Section.Step
            crumb="Distribution strategy"
            fields={["distributionStrategy"]}
          >
            <Forms.Field.CardSelector title="Distribution strategy">
              <Products.Form.Fields
                schema="create"
                include={["distributionStrategy"]}
              />
            </Forms.Field.CardSelector>

            <DocumentationLink page="products" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Product attributes"
            fields={[
              "name",
              "code",
              "url",
              "platforms",
              "permissions",
              "metadata",
            ]}
          >
            <Forms.Field.Title>
              <Products.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Product attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Products.Form.Fields
                    schema="create"
                    include={["code", "url"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Products.Form.Fields
                    schema="create"
                    include={["permissions", "platforms"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <Products.Form.Fields
                schema="create"
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="products" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Form>
    </Forms.Container.Dialog>
  )
}
