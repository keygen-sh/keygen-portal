import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"

import { transformingZodResolver } from "@/lib/form"
import { recordToMetadataPairs } from "@/schemas/metadata"

import { Separator } from "@/components/ui/separator"

import * as Schemas from "@/schemas"
import { ReleaseChannel } from "@/types/releases"

import {
  useGetRelease,
  useUpdateRelease,
  useListReleaseConstraints,
  useAttachReleaseConstraints,
  useDetachReleaseConstraints,
  useChangeReleasePackage,
} from "@/queries/releases"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Releases from "@/components/releases"

interface EditReleaseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditReleaseForm({
  open,
  onOpenChange,
}: EditReleaseFormProps) {
  const { id } = useParams({ from: "/$accountId/app/releases/$id" })
  const { data: release } = useGetRelease(id)
  const { data: releaseConstraints = [] } = useListReleaseConstraints(
    release?.id ?? "",
  )

  const updateRelease = useUpdateRelease(release?.id ?? "")
  const attachConstraints = useAttachReleaseConstraints()
  const detachConstraints = useDetachReleaseConstraints()
  const changePackage = useChangeReleasePackage()

  const currentPackageId = release?.relationships.package?.data?.id ?? null

  const form = useForm<
    Schemas.Releases.UpdateFormValues,
    unknown,
    Schemas.Releases.UpdateValues
  >({
    resolver: transformingZodResolver(Schemas.Releases.UpdateSchema),
    mode: "onChange",
    values: {
      name: release?.attributes.name ?? "",
      version: release?.attributes.version,
      tag: release?.attributes.tag ?? "",
      channel: release?.attributes.channel ?? ReleaseChannel.Stable,
      description: release?.attributes.description ?? "",
      backdated: release?.attributes.backdated ?? null,
      metadata: recordToMetadataPairs(release?.attributes.metadata),
      constraints: {
        attach: releaseConstraints
          .map((c) => c.relationships.entitlement?.data?.id ?? "")
          .filter(Boolean),
      },
      packageId: currentPackageId,
    },
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Releases.UpdateValues) => {
      if (!release) return

      const currentEntitlementIds = releaseConstraints
        .map((c) => c.relationships.entitlement?.data?.id ?? "")
        .filter(Boolean)
      const selectedEntitlementIds = values.constraints?.attach ?? []

      const attachEntitlementIds = selectedEntitlementIds.filter(
        (id) => !currentEntitlementIds.includes(id),
      )
      const detachConstraintIds = releaseConstraints
        .filter(
          (c) =>
            !selectedEntitlementIds.includes(
              c.relationships.entitlement?.data?.id ?? "",
            ),
        )
        .map((c) => c.id)

      if (detachConstraintIds.length > 0)
        await detachConstraints.mutateAsync({
          releaseId: release.id,
          constraintIds: detachConstraintIds,
        })
      if (attachEntitlementIds.length > 0)
        await attachConstraints.mutateAsync({
          releaseId: release.id,
          entitlementIds: attachEntitlementIds,
        })

      const selectedPackageId = values.packageId ?? null
      if (selectedPackageId !== currentPackageId)
        await changePackage.mutateAsync({
          releaseId: release.id,
          packageId: selectedPackageId,
        })

      await updateRelease.mutateAsync(values)
      toast({ message: "Release updated", variant: "success" })
    },
    [
      release,
      updateRelease,
      releaseConstraints,
      attachConstraints,
      detachConstraints,
      changePackage,
      currentPackageId,
    ],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Sheet
          title="Editing an existing release"
          onSubmit={handleSubmit}
          errorMessage="Failed to update release"
          isPending={
            updateRelease.isPending ||
            attachConstraints.isPending ||
            detachConstraints.isPending ||
            changePackage.isPending
          }
          submitLabel="Update"
          className="md:h-[74vh]!"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Releases.Form.Fields
                schema="edit"
                include={["name", "tag"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Releases.Form.Fields
                schema="edit"
                include={["backdated"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Releases.Form.Fields
            schema="edit"
            include={["description"]}
            fieldVariant="stacking"
          />

          <Separator className="my-8" />

          <Forms.Section.Columns title="Relationships">
            <Forms.Section.Column>
              <Releases.Form.Fields
                schema="edit"
                include={["constraints.attach"]}
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Releases.Form.Fields
                schema="edit"
                include={["packageId"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Releases.Form.Fields
            schema="edit"
            include={["metadata"]}
            fieldVariant="stacking"
          />
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
