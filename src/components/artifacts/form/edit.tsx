import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"

import { useGetArtifact, useUpdateArtifact } from "@/queries/artifacts"

import { toast } from "@/lib/toast"
import { recordToMetadataPairs } from "@/schemas/metadata"

import * as Forms from "@/components/forms"
import * as Artifacts from "@/components/artifacts"

interface EditArtifactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditArtifactForm({
  open,
  onOpenChange,
}: EditArtifactFormProps) {
  const { id } = useParams({ from: "/$accountId/app/artifacts/$id" })
  const { data: artifact } = useGetArtifact(id)

  const updateArtifact = useUpdateArtifact(artifact?.id ?? "")

  const form = useForm<
    Schemas.Artifacts.UpdateFormValues,
    unknown,
    Schemas.Artifacts.UpdateValues
  >({
    resolver: zodResolver(Schemas.Artifacts.UpdateSchema),
    mode: "onChange",
    values: {
      filesize: artifact?.attributes.filesize ?? 0,
      signature: artifact?.attributes.signature ?? null,
      checksum: artifact?.attributes.checksum ?? null,
      metadata: recordToMetadataPairs(artifact?.attributes.metadata),
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Artifacts.UpdateValues) => {
      if (!artifact) return

      await updateArtifact.mutateAsync(values)
      toast({ message: "Artifact updated", variant: "success" })
    },
    [artifact, updateArtifact],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing artifact"
          onSubmit={handleSubmit}
          errorMessage="Failed to update artifact"
          isPending={updateArtifact.isPending}
          submitLabel="Update"
          className="md:h-[48vh]!"
        >
          <Artifacts.Form.Fields
            schema="edit"
            include={["filesize"]}
            fieldVariant="stacking"
          />

          <Separator className="my-8" />

          <Forms.Section.Columns title="Verification">
            <Forms.Section.Column>
              <Artifacts.Form.Fields
                schema="edit"
                include={["signature"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Artifacts.Form.Fields
                schema="edit"
                include={["checksum"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Artifacts.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
