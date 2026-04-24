import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"

import { useGetPackage, useUpdatePackage } from "@/queries/packages"

import { toast } from "@/lib/toast"
import { recordToMetadataPairs } from "@/schemas/metadata"

import * as Forms from "@/components/forms"
import * as Packages from "@/components/packages"

interface EditPackageFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditPackageForm({
  open,
  onOpenChange,
}: EditPackageFormProps) {
  const { id } = useParams({ from: "/$accountId/app/packages/$id" })
  const { data: pkg } = useGetPackage(id)

  const updatePackage = useUpdatePackage(pkg?.id ?? "")

  const form = useForm<
    Schemas.Packages.UpdateFormValues,
    unknown,
    Schemas.Packages.UpdateValues
  >({
    resolver: zodResolver(Schemas.Packages.UpdateSchema),
    mode: "onChange",
    values: {
      name: pkg?.attributes.name ?? "",
      key: pkg?.attributes.key ?? "",
      engine: pkg?.attributes.engine ?? null,
      metadata: recordToMetadataPairs(pkg?.attributes.metadata),
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Packages.UpdateValues) => {
      if (!pkg) return

      await updatePackage.mutateAsync(values)
      toast({ message: "Package updated", variant: "success" })
    },
    [pkg, updatePackage],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing package"
          onSubmit={handleSubmit}
          errorMessage="Failed to update package"
          isPending={updatePackage.isPending}
          submitLabel="Update"
          className="md:h-[74vh]!"
        >
          <Forms.Field.CardSelector
            title="Package engine"
            optional
            className="p-0"
          >
            <Packages.Form.Fields schema="edit" include={["engine"]} />
          </Forms.Field.CardSelector>

          <Separator className="my-8" />

          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Packages.Form.Fields
                schema="edit"
                include={["name"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Packages.Form.Fields
                schema="edit"
                include={["key"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Packages.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
