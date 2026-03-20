import { useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Binary,
  Package,
  TestTube,
  PackageOpen,
  FlaskConical,
} from "lucide-react"

import * as Schemas from "@/schemas"
import { ReleaseChannel } from "@/types/releases"

import {
  useCreateRelease,
  useAttachReleaseConstraints,
} from "@/queries/releases"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"

import * as Forms from "@/components/forms"
import * as Releases from "@/components/releases"
import DocumentationLink from "@/components/documentation-link"
import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

interface CreateReleaseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateReleaseForm({
  open,
  onOpenChange,
}: CreateReleaseFormProps) {
  const form = useForm<Schemas.Releases.CreateValues>({
    resolver: zodResolver(Schemas.Releases.CreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      version: "",
      tag: "",
      channel: ReleaseChannel.Stable,
      description: "",
      metadata: {},
      backdated: null,
      productId: "",
      constraints: { attach: [] },
      packages: { attach: [] },
    },
  })

  const createRelease = useCreateRelease()
  const attachConstraints = useAttachReleaseConstraints()
  const navigateToResource = useResourceNavigate()

  const selectedChannel = useWatch({
    control: form.control,
    name: "channel",
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Releases.CreateValues) => {
      const release = await createRelease.mutateAsync(values)

      const entitlementIds = values.constraints?.attach ?? []
      if (entitlementIds.length > 0)
        await attachConstraints.mutateAsync({
          releaseId: release.id,
          entitlementIds,
        })

      toast({ message: "Release created", variant: "success" })
      onOpenChange(false)
      await navigateToResource(release)
    },
    [createRelease, attachConstraints, navigateToResource, onOpenChange],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog open={open} onOpenChange={onOpenChange}>
        <Forms.Layout.Wizard
          onBack={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isPending={createRelease.isPending || attachConstraints.isPending}
          description={
            <BadgeGroup prefix="Creating a new" suffix="release">
              {selectedChannel === ReleaseChannel.Stable ? (
                <BadgeGroupItem>
                  <Package />
                  Stable
                </BadgeGroupItem>
              ) : selectedChannel === ReleaseChannel.Rc ? (
                <BadgeGroupItem>
                  <PackageOpen />
                  Release Candidate
                </BadgeGroupItem>
              ) : selectedChannel === ReleaseChannel.Beta ? (
                <BadgeGroupItem>
                  <FlaskConical />
                  Beta
                </BadgeGroupItem>
              ) : selectedChannel === ReleaseChannel.Alpha ? (
                <BadgeGroupItem>
                  <TestTube />
                  Alpha
                </BadgeGroupItem>
              ) : (
                <BadgeGroupItem>
                  <Binary />
                  Dev
                </BadgeGroupItem>
              )}
            </BadgeGroup>
          }
          errorMessage="Failed to create release"
          className="md:h-[52vh]!"
        >
          <Forms.Section.Step crumb="Release channel" fields={["channel"]}>
            <Forms.Field.CardSelector title="Release channel">
              <Releases.Form.Fields schema="create" include={["channel"]} />
            </Forms.Field.CardSelector>

            <DocumentationLink page="releases" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Release attributes"
            fields={["name", "productId", "version", "backdated"]}
          >
            <Forms.Field.Title>
              <Releases.Form.Fields
                schema="create"
                include={["name"]}
                titleVariant
                autoFocus="name"
              />
            </Forms.Field.Title>

            <Forms.Section.Card title="Release attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Releases.Form.Fields
                    schema="create"
                    include={["productId"]}
                    fieldVariant="stacking"
                  />
                  <Releases.Form.Fields
                    schema="create"
                    include={["backdated"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Releases.Form.Fields
                    schema="create"
                    include={["version"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>
            </Forms.Section.Card>

            <DocumentationLink page="releases" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Relationships"
            fields={["constraints.attach", "packages.attach"]}
          >
            <Forms.Section.Card title="Relationships">
              <Releases.Form.Fields
                schema="create"
                include={["constraints.attach"]}
              />

              <Releases.Form.Fields
                schema="create"
                include={["packages.attach"]}
              />
            </Forms.Section.Card>

            <DocumentationLink page="releases" />
          </Forms.Section.Step>

          <Forms.Section.Step
            crumb="Additional configuration"
            fields={["tag", "description", "metadata"]}
          >
            <Forms.Section.Card title="Release attributes">
              <Forms.Section.Columns>
                <Forms.Section.Column>
                  <Releases.Form.Fields
                    schema="create"
                    include={["tag"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
                <Forms.Section.Column>
                  <Releases.Form.Fields
                    schema="create"
                    include={["description"]}
                    fieldVariant="stacking"
                  />
                </Forms.Section.Column>
              </Forms.Section.Columns>

              <Releases.Form.Fields
                schema="create"
                include={["metadata"]}
                fieldVariant="stacking"
              />
            </Forms.Section.Card>

            <DocumentationLink page="releases" />
          </Forms.Section.Step>
        </Forms.Layout.Wizard>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
