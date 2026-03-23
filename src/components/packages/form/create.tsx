import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as Schemas from "@/schemas"

import { useCreatePackage } from "@/queries/packages"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Packages from "@/components/packages"
import DocumentationLink from "@/components/documentation-link"

interface CreatePackageFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreatePackageForm({
  open,
  onOpenChange,
}: CreatePackageFormProps) {
  const form = useForm<Schemas.Packages.CreateValues>({
    resolver: zodResolver(Schemas.Packages.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      key: "",
      engine: null,
      metadata: {},
      productId: "",
    },
  })

  const createPackage = useCreatePackage()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Packages.CreateValues) => {
      const pkg = await createPackage.mutateAsync(values)

      toast({ message: "Package created", variant: "success" })
      await navigateToResource(pkg)
    },
    [createPackage, navigateToResource],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createPackage.isPending}
          description="Creating a new package"
          errorMessage="Failed to create package"
          className="md:h-[52vh]!"
        >
          <Forms.Section.Step crumb="Package engine" fields={["engine"]}>
            <Forms.Field.CardSelector title="Package engine" optional>
              <Packages.Form.Fields schema="create" include={["engine"]} />
            </Forms.Field.CardSelector>

            <DocumentationLink page="packages" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Package attributes"
            fields={["name", "productId", "key"]}
          >
            <Forms.Field.Title>
              <Packages.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Package attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Packages.Form.Fields
                    schema="create"
                    include={["productId"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Packages.Form.Fields
                    schema="create"
                    include={["key"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="packages" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Additional configuration"
            fields={["metadata"]}
          >
            <Forms.Section.Card title="Package attributes">
              <Packages.Form.Fields
                schema="create"
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="packages" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
