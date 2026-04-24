import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"

import * as Schemas from "@/schemas"

import { useCreateArtifact } from "@/queries/artifacts"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"
import { transformingZodResolver } from "@/lib/form"

import { Artifact } from "@/types/artifacts"

import * as Forms from "@/components/forms"
import * as Artifacts from "@/components/artifacts"
import DocumentationLink from "@/components/documentation-link"

interface CreateArtifactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateArtifactForm({
  open,
  onOpenChange,
}: CreateArtifactFormProps) {
  const [upload, setUpload] = useState<{
    artifact: Artifact
    url: string
  } | null>(null)

  const form = useForm<
    Schemas.Artifacts.CreateFormValues,
    unknown,
    Schemas.Artifacts.CreateValues
  >({
    resolver: transformingZodResolver(Schemas.Artifacts.CreateSchema),
    mode: "onChange",
    defaultValues: {
      filename: "",
      filetype: null,
      filesize: null,
      platform: null,
      arch: null,
      signature: null,
      checksum: null,
      metadata: [],
      releaseId: "",
    },
  })

  const createArtifact = useCreateArtifact()
  const navigateToResource = useResourceNavigate()

  const handleSubmit = useCallback(
    async (values: Schemas.Artifacts.CreateValues) => {
      const artifact = await createArtifact.mutateAsync(values)

      toast({ message: "Artifact created", variant: "success" })

      const redirect = artifact.links?.redirect
      if (redirect) {
        setUpload({ artifact, url: redirect })
      } else {
        await navigateToResource(artifact)
      }
    },
    [createArtifact, navigateToResource],
  )

  const handleUploadClose = useCallback(() => {
    if (upload) {
      void navigateToResource(upload.artifact)
    }

    setUpload(null)
  }, [upload, navigateToResource])

  return (
    <Forms.Provider form={form}>
      {!upload && (
        <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
          <Forms.Layout.Wizard
            onBack={() => onOpenChange(false)}
            onSubmit={handleSubmit}
            isPending={createArtifact.isPending}
            description="Creating a new artifact"
            errorMessage="Failed to create artifact"
            className="md:h-[52vh]!"
          >
            <Forms.Section.Step
              crumb="Artifact attributes"
              fields={["filename", "releaseId", "filetype", "filesize"]}
            >
              <Forms.Field.Title>
                <Artifacts.Form.Fields
                  schema="create"
                  include={["filename"]}
                  titleVariant
                  autoFocus="filename"
                />
              </Forms.Field.Title>

              <Forms.Section.Card title="Artifact attributes">
                <Artifacts.Form.Fields
                  schema="create"
                  include={["releaseId"]}
                  fieldVariant="stacking"
                />
                <Forms.Section.Columns>
                  <Forms.Section.Column>
                    <Artifacts.Form.Fields
                      schema="create"
                      include={["filesize"]}
                      fieldVariant="stacking"
                    />
                  </Forms.Section.Column>
                  <Forms.Section.Column>
                    <Artifacts.Form.Fields
                      schema="create"
                      include={["filetype"]}
                      fieldVariant="stacking"
                    />
                  </Forms.Section.Column>
                </Forms.Section.Columns>
              </Forms.Section.Card>

              <DocumentationLink page="artifacts" />
            </Forms.Section.Step>

            <Forms.Section.Step
              crumb="Additional configuration"
              fields={["platform", "arch", "signature", "checksum", "metadata"]}
            >
              <Forms.Section.Card title="Additional configuration">
                <Forms.Section.Columns>
                  <Forms.Section.Column>
                    <Artifacts.Form.Fields
                      schema="create"
                      include={["arch"]}
                      fieldVariant="stacking"
                    />
                    <Artifacts.Form.Fields
                      schema="create"
                      include={["signature"]}
                      fieldVariant="stacking"
                    />
                  </Forms.Section.Column>
                  <Forms.Section.Column>
                    <Artifacts.Form.Fields
                      schema="create"
                      include={["platform"]}
                      fieldVariant="stacking"
                    />
                    <Artifacts.Form.Fields
                      schema="create"
                      include={["checksum"]}
                      fieldVariant="stacking"
                    />
                  </Forms.Section.Column>
                </Forms.Section.Columns>
                <Artifacts.Form.Fields
                  schema="create"
                  include={["metadata"]}
                  fieldVariant="stacking"
                />
              </Forms.Section.Card>

              <DocumentationLink page="artifacts" />
            </Forms.Section.Step>
          </Forms.Layout.Wizard>
        </Forms.Container.Dialog>
      )}

      {upload && (
        <Artifacts.Dialog.Upload
          url={upload.url}
          open
          onClose={handleUploadClose}
        />
      )}
    </Forms.Provider>
  )
}
